import { Literal, NamedNode, Variable } from "@rdfjs/types";
import * as DataFactory from "@rdfjs/data-model" ;
import { BgpPattern, GroupPattern, OperationExpression, Pattern, UnionPattern, Triple, IriTerm, BlankTerm, VariableTerm, QuadTerm, PropertyPath, Term } from "sparqljs";
import SparqlFactory from "../../../generators/SparqlFactory";


export const buildDateRangeOrExactDatePattern = (
  startDate: Literal,
  endDate: Literal,
  subjectSelectorVar: Variable,
  beginDatePred: NamedNode,
  endDatePred: NamedNode,
  exactDatePred: NamedNode,
  objectVariable: Variable
): Pattern => {
  
  if(exactDatePred != null) {

    // first alternative of the union to test exact date
    let exactDateVarName = DataFactory.variable(objectVariable.value+"_exact");
    let firstAlternative = SparqlFactory.buildGroupPattern(
      [
        SparqlFactory.buildBgpPattern(
          [
            SparqlFactory.buildTriple(
              subjectSelectorVar,
              exactDatePred,
              exactDateVarName
            )
          ]
        ),
        // exact date is within provided date range
        SparqlFactory.buildFilterTime(
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
      subjectSelectorVar,
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
      subjectSelectorVar,
      beginDatePred,
      endDatePred,      
      objectVariable
    );
  }
}

export const buildDateRangePattern = (
  startDate: Literal,
  endDate: Literal,
  subjectSelectorVar: Variable,
  beginDatePred: NamedNode,
  endDatePred: NamedNode,
  objectVariable: Variable
): Pattern => {
  
  // we have provided both begin and end date criteria
  if(startDate != null && endDate != null) {
    
    // 1. case where the resource has both start date and end date
    let firstAlternative:GroupPattern = SparqlFactory.buildGroupPattern([]);

    let bgp:BgpPattern = SparqlFactory.buildBgpPattern([]);
    
    let beginDateVarName = DataFactory.variable(objectVariable.value+`_begin`);
		let endDateVarName = DataFactory.variable(objectVariable.value+`_end`);

    bgp.triples.push(
      SparqlFactory.buildTriple(
        subjectSelectorVar,
        beginDatePred,
        beginDateVarName
      )
    );

    bgp.triples.push(
      SparqlFactory.buildTriple(
        subjectSelectorVar,
        endDatePred,
        endDateVarName
      )
    );

		firstAlternative.patterns.push(bgp);

    // begin date is before given end date
    firstAlternative.patterns.push(SparqlFactory.buildFilterTime(null, endDate, beginDateVarName));
    // end date is after given start date
    firstAlternative.patterns.push(SparqlFactory.buildFilterTime(startDate, null, endDateVarName));
			
    // 2. case where the resource has only a start date
    let secondAlternative:GroupPattern = SparqlFactory.buildGroupPattern([]);

    let secondBgp:BgpPattern = SparqlFactory.buildBgpPattern([]);
    secondBgp.triples.push(
      SparqlFactory.buildTriple(
        subjectSelectorVar,
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
                subjectSelectorVar,
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
    secondAlternative.patterns.push(SparqlFactory.buildFilterTime(null, endDate, beginDateVarName));
    
    // 3. case where the resource has only a end date
    let thirdAlternative:GroupPattern = SparqlFactory.buildGroupPattern([]);
    let thirdBgp:BgpPattern = SparqlFactory.buildBgpPattern([]);
    thirdBgp.triples.push(
      SparqlFactory.buildTriple(
        subjectSelectorVar,
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
                subjectSelectorVar,
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
    thirdAlternative.patterns.push(SparqlFactory.buildFilterTime(startDate, null, endDateVarName));


    return SparqlFactory.buildUnionPattern([firstAlternative, secondAlternative, thirdAlternative]); 
  // we have provided only a start date
  } else if(startDate != null && endDate === null) {
    
    let endDateVarName = DataFactory.variable(objectVariable.value+"_end");
    var bgp = SparqlFactory.buildBgpPattern([
      SparqlFactory.buildTriple(
        subjectSelectorVar,
        endDatePred,
        endDateVarName
      )
    ]);

    // end date is after given start date
    var filter = SparqlFactory.buildFilterTime(startDate, null, endDateVarName);

    // if the resource has no end date, and has only a start date
    // then it necessarily overlaps with the provided open-ended range
    // so let's avoid this case for the moment
    return SparqlFactory.buildGroupPattern([bgp,filter]);

  // we have provided only a end date
  } else if(startDate === null && endDate != null) {
    let beginDateVarName = DataFactory.variable(objectVariable.value+"_begin");
    var bgp = SparqlFactory.buildBgpPattern([
      SparqlFactory.buildTriple(
        subjectSelectorVar,
        beginDatePred,
        beginDateVarName
      )
    ]);
    // begin date is before given end date
    var filter = SparqlFactory.buildFilterTime(null, endDate, beginDateVarName);

    return SparqlFactory.buildGroupPattern([bgp,filter]);
  }
  
 
};
