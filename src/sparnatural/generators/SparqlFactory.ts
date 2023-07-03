import { BgpPattern, BindPattern, BlankTerm, FilterPattern, GroupPattern, IriTerm, OptionalPattern, Pattern, PropertyPath, QuadTerm, ServicePattern, Term, Triple, UnionPattern, VariableTerm, Wildcard } from "sparqljs";
import * as DataFactory from "@rdfjs/data-model" ;
import { Literal, Variable } from "@rdfjs/types";
import {  Parser as SparqlParser } from "sparqljs";
import { NamedNode } from "n3";

export default class SparqlFactory {
  static sparqlParser =  new SparqlParser({ pathOnly: true } as any);
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
            variable,
            startDate
          ]
        }) ;
      }
      if (endDate != null) {
        filters.push( {
          type: "operation",
          operator: "<=",
          args: [
            variable,
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
      predicate: DataFactory.namedNode(pred),
      object: obj as VariableTerm,
    };
  }
  
  static parsePropertyPath(path:string): IriTerm | PropertyPath {
    return this.sparqlParser.parse(path) as unknown as IriTerm | PropertyPath
  }

}

