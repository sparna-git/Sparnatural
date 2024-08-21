import { Literal, NamedNode, Variable } from "@rdfjs/types";
import { DataFactory } from 'rdf-data-factory';
import { BgpPattern, GroupPattern, OperationExpression, Pattern, UnionPattern, Triple, IriTerm, BlankTerm, VariableTerm, QuadTerm, PropertyPath, Term } from "sparqljs";
import SparqlFactory from "../../../generators/sparql/SparqlFactory";

const factory = new DataFactory();

export const buildDateRangeOrExactDatePattern = (
  startDate: Literal,
  endDate: Literal,
  startClassVar: Variable,
  beginDatePred: NamedNode,
  endDatePred: NamedNode,
  exactDatePred: NamedNode,
  objectVariable: Variable
): Pattern => {
  
  if(exactDatePred != null) {

    // first alternative of the union to test exact date
    let exactDateVarName = factory.variable(objectVariable.value+"_exact");
    let firstAlternative = SparqlFactory.buildGroupPattern(
      [
        SparqlFactory.buildBgpPattern(
          [
            SparqlFactory.buildTriple(
              startClassVar,
              exactDatePred,
              exactDateVarName
            )
          ]
        ),
        // exact date is within provided date range
        SparqlFactory.buildFilterRangeDateOrNumber(
          startDate,
          endDate,
          exactDateVarName
        )
      ]
    );

    // second alternative to test date range
    let secondAlternative = buildDateRangePattern(
      startDate,
      endDate,
      startClassVar,
      beginDatePred,
      endDatePred,      
      objectVariable
    );

    // return as an array so that caller can have generic forEach loop to all
    // every element to outer query
    return SparqlFactory.buildUnionPattern([firstAlternative, secondAlternative]); 
  } else {
    return buildDateRangePattern(
      startDate,
      endDate,
      startClassVar,
      beginDatePred,
      endDatePred,      
      objectVariable
    );
  }
}

export const buildDateRangePattern = (
  startDate: Literal,
  endDate: Literal,
  startClassVar: Variable,
  beginDatePred: NamedNode,
  endDatePred: NamedNode,
  objectVariable: Variable
): Pattern => {
  
  // we have provided both begin and end date criteria
  if(startDate != null && endDate != null) {
    
    // 1. case where the resource has both start date and end date
    let firstAlternative:GroupPattern = SparqlFactory.buildGroupPattern([]);

    let bgp:BgpPattern = SparqlFactory.buildBgpPattern([]);
    
    let beginDateVarName = factory.variable(objectVariable.value+`_begin`);
		let endDateVarName = factory.variable(objectVariable.value+`_end`);

    bgp.triples.push(
      SparqlFactory.buildTriple(
        startClassVar,
        beginDatePred,
        beginDateVarName
      )
    );

    bgp.triples.push(
      SparqlFactory.buildTriple(
        startClassVar,
        endDatePred,
        endDateVarName
      )
    );

		firstAlternative.patterns.push(bgp);

    // begin date is before given end date
    firstAlternative.patterns.push(SparqlFactory.buildFilterRangeDateOrNumber(null, endDate, beginDateVarName));
    // end date is after given start date
    firstAlternative.patterns.push(SparqlFactory.buildFilterRangeDateOrNumber(startDate, null, endDateVarName));
			
    // 2. case where the resource has only a start date
    let secondAlternative:GroupPattern = SparqlFactory.buildGroupPattern([]);

    let secondBgp:BgpPattern = SparqlFactory.buildBgpPattern([]);
    secondBgp.triples.push(
      SparqlFactory.buildTriple(
        startClassVar,
        beginDatePred,
        endDateVarName
      )
    );
    secondAlternative.patterns.push(secondBgp);
    let notExistsEndDate = SparqlFactory.buildNotExistsPattern(
      SparqlFactory.buildGroupPattern(
        [
          SparqlFactory.buildBgpPattern(
            [
              SparqlFactory.buildTriple(
                startClassVar,
                endDatePred,
                endDateVarName
              )
            ]
          )
        ]
      )
    );

    secondAlternative.patterns.push(notExistsEndDate);
    // begin date is before given end date
    secondAlternative.patterns.push(SparqlFactory.buildFilterRangeDateOrNumber(null, endDate, beginDateVarName));
    
    // 3. case where the resource has only a end date
    let thirdAlternative:GroupPattern = SparqlFactory.buildGroupPattern([]);
    let thirdBgp:BgpPattern = SparqlFactory.buildBgpPattern([]);
    thirdBgp.triples.push(
      SparqlFactory.buildTriple(
        startClassVar,
        endDatePred,
        endDateVarName
      )
    );
    thirdAlternative.patterns.push(thirdBgp);

    let notExistsBeginDate = SparqlFactory.buildNotExistsPattern(
      SparqlFactory.buildGroupPattern(
        [
          SparqlFactory.buildBgpPattern(
            [
              SparqlFactory.buildTriple(
                startClassVar,
                beginDatePred,
                beginDateVarName
              )
            ]
          )
        ]
      )
    );

    thirdAlternative.patterns.push(notExistsBeginDate);
    // end date is after given start date
    thirdAlternative.patterns.push(SparqlFactory.buildFilterRangeDateOrNumber(startDate, null, endDateVarName));


    return SparqlFactory.buildUnionPattern([firstAlternative, secondAlternative, thirdAlternative]); 
  // we have provided only a start date
  } else if(startDate != null && endDate === null) {
    
    let endDateVarName = factory.variable(objectVariable.value+"_end");
    var bgp = SparqlFactory.buildBgpPattern([
      SparqlFactory.buildTriple(
        startClassVar,
        endDatePred,
        endDateVarName
      )
    ]);

    // end date is after given start date
    var filter = SparqlFactory.buildFilterRangeDateOrNumber(startDate, null, endDateVarName);

    // if the resource has no end date, and has only a start date
    // then it necessarily overlaps with the provided open-ended range
    // so let's avoid this case for the moment
    return SparqlFactory.buildGroupPattern([bgp,filter]);

  // we have provided only a end date
  } else if(startDate === null && endDate != null) {
    let beginDateVarName = factory.variable(objectVariable.value+"_begin");
    var bgp = SparqlFactory.buildBgpPattern([
      SparqlFactory.buildTriple(
        startClassVar,
        beginDatePred,
        beginDateVarName
      )
    ]);
    // begin date is before given end date
    var filter = SparqlFactory.buildFilterRangeDateOrNumber(null, endDate, beginDateVarName);

    return SparqlFactory.buildGroupPattern([bgp,filter]);
  }
  
 
};
