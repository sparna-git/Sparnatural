import { BgpPattern, BlankTerm, FilterPattern, GroupPattern, IriTerm, OptionalPattern, Pattern, PropertyPath, QuadTerm, ServicePattern, Term, Triple, UnionPattern, VariableTerm, Wildcard } from "sparqljs";
import * as DataFactory from "@rdfjs/data-model" ;
import { Literal, Variable } from "@rdfjs/types";

export default class SparqlFactory {

    static buildBgpPattern(triples: Triple[]): BgpPattern {
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

    static buildFilterRegex(texte: Literal, variable: Variable): FilterPattern {			
      return {
        type: "filter",
        expression: {
          type: "operation",
          operator: "regex",
          args: [
            {
              type: "operation",
              operator: "str",
              args: [ variable ]
            },
            texte,
            DataFactory.literal(`i`)
          ],
        },
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

    static buildFilterStringEquals(texte: Literal, variable: Variable): FilterPattern {			
      return {
        type: "filter",
        expression: {
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
        }
      } ;
    }

    static buildFilterTime(
        startDate: Literal,
        endDate: Literal,
        variable: Variable
    ): Pattern {
        
        var filters = new Array ;
        
        if (startDate != null) {
          filters.push( {
            type: "operation",
            operator: ">=",
            args: [
              {
                type: "functioncall",
                function: DataFactory.namedNode(
                  "http://www.w3.org/2001/XMLSchema#dateTime"
                ),
                args : [
                  variable
                ]
              },
              startDate
            ]
          }) ;
        }
        if (endDate != null) {
          filters.push( {
            type: "operation",
            operator: "<=",
            args: [
              {
                type: "functioncall",
                function: DataFactory.namedNode(
                  "http://www.w3.org/2001/XMLSchema#dateTime"
                ),
                "args" : [
                  variable
                ]
              },
              endDate
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

      static buildRdfTypeTriple(
        subject: IriTerm | BlankTerm | VariableTerm | QuadTerm,
        object: Term
    ): Triple | null {
        if(!subject?.value || !object?.value) return null
        return SparqlFactory.buildTriple(
            subject,
            DataFactory.namedNode("http://www.w3.org/1999/02/22-rdf-syntax-ns#type"),
            object
        );
      }

      
  // It is the intersection between the startclass and endclass chosen.
  // example: ?person dpedia:birthplace ?country
  static buildPredicateTriple(
    subj: Variable,
    pred: string,
    obj: Variable
  ): Triple | null{
    if(!subj?.value || !pred || !obj?.value) return null
    return {
      subject: subj as VariableTerm,
      predicate: DataFactory.namedNode(pred),
      object: obj as VariableTerm,
    };
  }
}

