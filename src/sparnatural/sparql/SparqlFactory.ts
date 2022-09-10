import { BgpPattern, BlankTerm, FilterPattern, GroupPattern, IriTerm, OptionalPattern, Pattern, PropertyPath, QuadTerm, Term, Triple, UnionPattern, VariableTerm } from "sparqljs";
import * as DataFactory from "@rdfjs/data-model" ;
import { Literal, Variable } from "@rdfjs/types";

export default class SparqlFactory {

    // Builds the 'filter' triples for OPTIONAL or NOTEXISTS
    static buildFilterTriples(triples:Triple[],rdfPattern:Pattern[],wherePtrn:Pattern[]):GroupPattern{
      const ptrn:Array<Pattern> = []
      ptrn.push(SparqlFactory.buildBgpPattern(triples))
      if (rdfPattern) ptrn.push(...rdfPattern);
      if (wherePtrn) ptrn.push(...wherePtrn);
      return {
        type: 'group',
        patterns: ptrn
      }
    }

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
  static buildIntersectionTriple(
    subj: Variable,
    pred: string,
    obj: Variable
  ): Triple | null{
    if(!subj || !pred || !obj) return null
    return {
      subject: subj as VariableTerm,
      predicate: DataFactory.namedNode(pred),
      object: obj as VariableTerm,
    };
  }
}

