import { AggregateExpression, BgpPattern, BindPattern, BlankTerm, FilterPattern, GroupPattern, IriTerm, OperationExpression, OptionalPattern, Pattern, PropertyPath, QuadTerm, ServicePattern, Term, Triple, UnionPattern, VariableExpression, VariableTerm, Wildcard } from "sparqljs";
import { Literal, Variable, NamedNode } from "@rdfjs/types";
import {  Parser as SparqlParser } from "sparqljs";
import { DataFactory } from 'rdf-data-factory';

const factory = new DataFactory();

export default class SparqlFactory {
  static sparqlParser =  new SparqlParser({ pathOnly: true } as any);

  /**
   * @param aggregation The aggregation function to apply
   * @param aggregatedVar The original variable being aggregated
   * @param asVar The final variable holding the result of the aggregation function
   * @returns An aggregation expression, always using a DISTINCT
   */
  static buildAggregateFunctionExpression(
    aggregation:string,
    aggregatedVar:Variable,
    asVar:Variable
  ):VariableExpression {
    var aggregateExpression:AggregateExpression = {
        type: "aggregate",
        aggregation: aggregation,
        // always use a DISTINCT, so that we don't count duplicated results
        // e.g. same result in different named graphs
        distinct: true,
        expression: aggregatedVar
    }

    // group_concat will always use ";" as separator
    if(aggregation === "group_concat") {
      aggregateExpression.separator = "; ";
    }  

    return {
      expression: aggregateExpression,
      variable : asVar
    }
  }


  static buildBgpPattern(triples: Triple[]): BgpPattern {
      if(triples.findIndex(t => (t == null)) > -1) {
        throw new Error("Trying to build a bgp pattern with null triple !");
      }
      return {
          type: "bgp",
          triples: triples,
      };
  }

  static buildGroupPattern(patterns: Pattern[]):GroupPattern {
      return {
        type: "group",
        patterns: patterns
      };
  }

  static buildUnionPattern(patterns: Pattern[]):UnionPattern {
      return {
        type: "union",
        patterns: patterns
      };
  }

  static buildServicePattern(patterns:Pattern[],serviceIRI:IriTerm): ServicePattern {
    return {
      type:'service',
      name:serviceIRI,
      silent:false,
      patterns: patterns
    }
  }

  static buildSubQuery(patterns: Pattern[]):GroupPattern {
    return {
      type: "group",
      patterns: [
        {
          type:"query",
          queryType:"SELECT",
          prefixes:{},
          variables: [new Wildcard()],
          where: patterns
        }
      ]
    };
}

  static buildExistsPattern(groupPattern: GroupPattern): FilterPattern {
      return {
        type: "filter",
        expression: {
          type: "operation",
          operator: "exists",
          args: [
              groupPattern
          ],
        },
      };
  }

  static buildNotExistsPattern(groupPattern: GroupPattern): FilterPattern {
      return {
        type: "filter",
        expression: {
          type: "operation",
          operator: "notexists",
          args: [
              groupPattern
          ],
        },
      };
  }

  static buildOptionalPattern(patterns: Pattern[]): OptionalPattern {
      return {
        type: "optional",
        patterns: patterns,
      };
  }

  static buildRegexOperation(texte: Literal, variable: Variable): OperationExpression {			
    return {
      type: "operation",
      operator: "regex",
      args: [
        {
          type: "operation",
          operator: "str",
          args: [ variable ]
        },
        texte,
        factory.literal(`i`)
      ]
    };
  }

  static buildFilterLangEquals(variable: Variable, lang:Literal): FilterPattern {			
    return {
      type: "filter",
      expression: {
        type: "operation",
        operator: "=",
        args: [
          {
            type: "operation",
            operator: "lang",
            args: [ variable ]
          },
          lang
        ],
      },
    };
  }

  /**
   * @param firstVariable First variable in the COALESCE
   * @param secondvariable Second variable in the COALESCE
   * @param finalVariable Finale variable of the BIND clause
   * @returns BIND(COALESCE(?var1, ?var2) AS ?finalVar)
   */
  static buildBindCoalescePattern(firstVariable:Variable, secondvariable:Variable, finalVariable:Variable): BindPattern {				
    return {
        type: "bind",
        expression: {
          type: "operation",
          operator: "coalesce",
          args: [
            firstVariable,
            secondvariable
          ]
        },
        variable:finalVariable
      };
  }

  static buildFilterStrInOrEquals(values: Literal[], variable: Variable): FilterPattern {			
    if(values.length == 1) {
      return {
        type: "filter",
        expression: {
          type: "operation",
          operator: "=",
          args: [
            {
              type: "operation",
              operator: "str",
              args: [ variable ]
            },
            values[0]
          ],
        },
      };
    } else {
      return {
        type: "filter",
        expression: {
          type: "operation",
          operator: "in",
          args: [
            {
              type: "operation",
              operator: "str",
              args: [ variable ]
            },
            values
          ],
        },
      };
    }

  }

  /**
   * Wraps the given operations in a filter with an OR operator
   * @param operations a flat array or operations
   * @returns 
   */
  static buildFilterOr(operations: OperationExpression[]): FilterPattern {			
    return {
      type: "filter",
      expression: SparqlFactory.combineWithOr(operations)
    } ;      
  }

  /**
   * Combines multiple operations with an || operator, recursively
   * @param operations a flet array or operations
   * @returns a hierarchy of || operations, each having 2 args
   */
  static combineWithOr(operations: OperationExpression[]): OperationExpression {			
    if(operations.length == 1) {
      return operations[0];     
    } else if(operations.length == 2) {
      return {
        type: "operation",
        operator: "||",
        args: operations
      };
    } else {
      return {
        type: "operation",
        operator: "||",
        args: [
          operations[0],
          SparqlFactory.combineWithOr(operations.slice(1))
        ]
      };
    }
  }

  /**
   * Builds an operation expression that compares the lowercase of a variable with the lowercase of a literal
   * @param texte 
   * @param variable 
   * @returns 
   */
  static buildOperationLcaseEquals(texte: Literal, variable: Variable): OperationExpression {			
    return {
        type: "operation",
        operator: "=",
        args: [					
          {
            type: "operation",
            operator: "lcase",
            args : [ variable ]
          },
          {
            type: "operation",
            operator: "lcase",
            args : [texte]
          }
        ]
    };
  }



  static buildFilterRangeDateOrNumber(
      rangeBegin: Literal|null,
      rangeEnd: Literal|null,
      variable: Variable
  ): Pattern {
      
      var filters = new Array ;
      
      if (rangeBegin != null) {
        filters.push( {
          type: "operation",
          operator: ">=",
          args: [
            variable,
            rangeBegin
          ]
        }) ;
      }
      if (rangeEnd != null) {
        filters.push( {
          type: "operation",
          operator: "<=",
          args: [
            variable,
            rangeEnd
          ]
        }) ;
      }
    
      if (filters.length == 2 ) {
        return {
          type: "filter",
          expression: {
            type: 'operation',
            operator: "&&",
            args: filters
          }
        } ;
      } else {
        return {
          type: "filter",
          expression: filters[0]
        } ;
      }
    
    }


  static buildTriple(
    subject: IriTerm | BlankTerm | VariableTerm | QuadTerm,
    predicate: IriTerm | VariableTerm | PropertyPath,
    object: Term
  ):Triple {
    return {
        subject: subject,
        predicate: predicate,
        object: object,
    };
  }

  static buildPropertyPathTriple(
    subject: IriTerm | BlankTerm | VariableTerm | QuadTerm,
    predicate: IriTerm | PropertyPath,
    object: Term 
  ):Triple {
    return {
      subject: subject,
      predicate: {
        type: 'path',
        pathType:'*' ,
        items: [predicate]
      },
      object: object,
    };
  }

  static buildTypeTriple(
    subject: IriTerm | BlankTerm | VariableTerm | QuadTerm,
    predicate: IriTerm | PropertyPath,
    object: Term
  ): Triple | null {
    if(!subject?.value || !object?.value) return null
    return SparqlFactory.buildTriple(
        subject,
        predicate,
        object
    );
  }
      
  // It is the intersection between the startclass and endclass chosen.
  // example: ?person dpedia:birthplace ?country
  static buildIntersectionTriple(
    subj: Variable,
    pred: string,
    obj: Variable
  ): Triple | null{
    if(!subj?.value || !pred || !obj?.value) return null
    return {
      subject: subj as VariableTerm,
      predicate: factory.namedNode(pred),
      object: obj as VariableTerm,
    };
  }
  
  static parsePropertyPath(path:string): IriTerm | PropertyPath {
    return this.sparqlParser.parse(path) as unknown as IriTerm | PropertyPath
  }

  static buildDateRangePattern(
    startDate: Literal,
    endDate: Literal,
    startClassVar: Variable,
    beginDatePred: NamedNode,
    endDatePred: NamedNode,
    objectVariable: Variable
  ): Pattern {
    
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
          beginDateVarName
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

  static buildDateRangeOrExactDatePattern(
    startDate: Literal,
    endDate: Literal,
    startClassVar: Variable,
    beginDatePred: NamedNode,
    endDatePred: NamedNode,
    exactDatePred: NamedNode,
    objectVariable: Variable
  ): Pattern{
    
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
      let secondAlternative = SparqlFactory.buildDateRangePattern(
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
      return SparqlFactory.buildDateRangePattern(
        startDate,
        endDate,
        startClassVar,
        beginDatePred,
        endDatePred,      
        objectVariable
      );
    }
  }

}

