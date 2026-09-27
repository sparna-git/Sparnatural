import {
  AstFactory,
  Expression,
  ExpressionOperation,
  GraphNode,
  Path,
  Pattern,
  PatternBgp,
  PatternBind,
  PatternFilter,
  PatternGroup,
  PatternOptional,
  PatternService,
  PatternUnion,
  TermBlank,
  TermIri,
  TermIriFull,
  TermLiteral,
  TermVariable,
  TripleNesting,
} from "@traqula/rules-sparql-1-1";
import { Parser } from "@traqula/parser-sparql-1-1";

// the AST factory building all Traqula nodes
// all nodes are built with an auto-generated source location, so that the generator prints them in full
const F = new AstFactory();

/**
 * Same as SparqlFactory, but building a Traqula AST instead of a SparqlJs one
 */
export default class SparqlFactoryV13 {
  static sparqlParser = new Parser();

  static buildVariable(name: string): TermVariable {
    return F.termVariable(name, F.gen());
  }

  static buildNamedNode(iri: string): TermIriFull {
    return F.termNamed(F.gen(), iri);
  }

  /**
   * @param value The lexical value of the literal
   * @param langOrDatatype Either a language code, or the datatype of the literal
   * @returns A literal, with a language, a datatype, or none of them
   */
  static buildLiteral(value: string, langOrDatatype?: string | TermIriFull): TermLiteral {
    if (langOrDatatype === undefined) {
      return F.termLiteral(F.gen(), value);
    } else if (typeof langOrDatatype === "string") {
      return F.termLiteral(F.gen(), value, langOrDatatype);
    } else {
      return F.termLiteral(F.gen(), value, langOrDatatype);
    }
  }

  static buildBlankNode(label: string): TermBlank {
    return F.termBlank(label, F.gen());
  }

  /**
   * @param aggregation The aggregation function to apply
   * @param aggregatedVar The original variable being aggregated
   * @param asVar The final variable holding the result of the aggregation function
   * @returns An aggregation expression, always using a DISTINCT
   */
  static buildAggregateFunctionExpression(
    aggregation:string,
    aggregatedVar:TermVariable,
    asVar:TermVariable
  ):PatternBind {
    // group_concat will always use ";" as separator
    let separator:string|undefined = (aggregation.toLowerCase() === "group_concat")?"; ":undefined;

    // always use a DISTINCT, so that we don't count duplicated results
    // e.g. same result in different named graphs
    return F.patternBind(
      F.aggregate(aggregation, true, aggregatedVar, separator, F.gen()),
      asVar,
      F.gen()
    );
  }

  static buildBgpPattern(triples: TripleNesting[]): PatternBgp {
      if(triples.findIndex(t => (t == null)) > -1) {
        throw new Error("Trying to build a bgp pattern with null triple !");
      }
      return F.patternBgp(triples, F.gen());
  }

  static buildGroupPattern(patterns: Pattern[]):PatternGroup {
      return F.patternGroup(patterns, F.gen());
  }

  static buildUnionPattern(patterns: PatternGroup[]):PatternUnion {
      return F.patternUnion(patterns, F.gen());
  }

  static buildServicePattern(patterns:Pattern[],serviceIRI:TermIri): PatternService {
    return F.patternService(serviceIRI, patterns, false, F.gen());
  }

  static buildExistsPattern(groupPattern: PatternGroup): PatternFilter {
      return F.patternFilter(
        F.expressionPatternOperation("exists", groupPattern, F.gen()),
        F.gen()
      );
  }

  static buildNotExistsPattern(groupPattern: PatternGroup): PatternFilter {
      return F.patternFilter(
        F.expressionPatternOperation("notexists", groupPattern, F.gen()),
        F.gen()
      );
  }

  static buildOptionalPattern(patterns: Pattern[]): PatternOptional {
      return F.patternOptional(patterns, F.gen());
  }

  static buildRegexOperation(texte: TermLiteral, variable: TermVariable): ExpressionOperation {
    return F.expressionOperation(
      "regex",
      [
        F.expressionOperation("str", [ variable ], F.gen()),
        texte,
        SparqlFactoryV13.buildLiteral(`i`)
      ],
      F.gen()
    );
  }

  static buildFilterLangEquals(variable: TermVariable, lang:TermLiteral): PatternFilter {
    return F.patternFilter(
      F.expressionOperation(
        "=",
        [
          F.expressionOperation("lang", [ variable ], F.gen()),
          lang
        ],
        F.gen()
      ),
      F.gen()
    );
  }

  /**
   * @param firstVariable First variable in the COALESCE
   * @param secondvariable Second variable in the COALESCE
   * @param finalVariable Finale variable of the BIND clause
   * @returns BIND(COALESCE(?var1, ?var2) AS ?finalVar)
   */
  static buildBindCoalescePattern(firstVariable:TermVariable, secondvariable:TermVariable, finalVariable:TermVariable): PatternBind {
    return F.patternBind(
      F.expressionOperation("coalesce", [ firstVariable, secondvariable ], F.gen()),
      finalVariable,
      F.gen()
    );
  }

  /**
   * Wraps the given operations in a filter with an OR operator
   * @param operations a flat array or operations
   * @returns
   */
  static buildFilterOr(operations: ExpressionOperation[]): PatternFilter {
    return F.patternFilter(SparqlFactoryV13.combineWithOr(operations), F.gen());
  }

  /**
   * Combines multiple operations with an || operator, recursively
   * @param operations a flet array or operations
   * @returns a hierarchy of || operations, each having 2 args
   */
  static combineWithOr(operations: ExpressionOperation[]): ExpressionOperation {
    if(operations.length == 1) {
      return operations[0];
    } else if(operations.length == 2) {
      return F.expressionOperation("||", operations, F.gen());
    } else {
      return F.expressionOperation(
        "||",
        [
          operations[0],
          SparqlFactoryV13.combineWithOr(operations.slice(1))
        ],
        F.gen()
      );
    }
  }

  /**
   * Builds an operation expression that compares the lowercase of a variable with the lowercase of a literal
   * @param texte
   * @param variable
   * @returns
   */
  static buildOperationLcaseEquals(texte: TermLiteral, variable: TermVariable): ExpressionOperation {
    return F.expressionOperation(
      "=",
      [
        F.expressionOperation("lcase", [ variable ], F.gen()),
        F.expressionOperation("lcase", [ texte ], F.gen())
      ],
      F.gen()
    );
  }

  /**
   * Builds a filter on a function call, e.g. FILTER(geof:sfWithin(?x, "..."))
   * @param functionIri The IRI of the function to call
   * @param args The arguments of the function
   */
  static buildFilterFunctionCall(functionIri: string, args: Expression[]): PatternFilter {
    return F.patternFilter(
      F.expressionFunctionCall(SparqlFactoryV13.buildNamedNode(functionIri), args, false, F.gen()),
      F.gen()
    );
  }

  static buildFilterRangeDateOrNumber(
      rangeBegin: TermLiteral|null,
      rangeEnd: TermLiteral|null,
      variable: TermVariable
  ): PatternFilter {

      var filters: ExpressionOperation[] = [] ;

      if (rangeBegin != null) {
        filters.push(F.expressionOperation(">=", [ variable, rangeBegin ], F.gen())) ;
      }
      if (rangeEnd != null) {
        filters.push(F.expressionOperation("<=", [ variable, rangeEnd ], F.gen())) ;
      }

      if (filters.length == 2 ) {
        return F.patternFilter(F.expressionOperation("&&", filters, F.gen()), F.gen()) ;
      } else {
        return F.patternFilter(filters[0], F.gen()) ;
      }

    }


  static buildTriple(
    subject: GraphNode,
    predicate: TermIri | TermVariable | Path,
    object: GraphNode
  ):TripleNesting {
    return F.triple(subject, predicate, object, F.gen());
  }

  static buildTypeTriple(
    subject: TermVariable,
    predicate: TermIri | Path,
    object: TermIri
  ): TripleNesting | null {
    if(!subject?.value || !object?.value) return null
    return SparqlFactoryV13.buildTriple(
        subject,
        predicate,
        object
    );
  }

  // It is the intersection between the startclass and endclass chosen.
  // example: ?person dpedia:birthplace ?country
  static buildIntersectionTriple(
    subj: TermVariable,
    pred: string,
    obj: TermVariable
  ): TripleNesting | null{
    if(!subj?.value || !pred || !obj?.value) return null
    return SparqlFactoryV13.buildTriple(
      subj,
      SparqlFactoryV13.buildNamedNode(pred),
      obj
    );
  }

  static parsePropertyPath(path:string): TermIri | Path {
    return this.sparqlParser.parsePath(path);
  }

  static buildDateRangePattern(
    startDate: TermLiteral,
    endDate: TermLiteral,
    startClassVar: TermVariable,
    beginDatePred: TermIriFull,
    endDatePred: TermIriFull,
    objectVariable: TermVariable
  ): PatternGroup | PatternUnion {

    // we have provided both begin and end date criteria
    if(startDate != null && endDate != null) {

      // 1. case where the resource has both start date and end date
      let firstAlternative:PatternGroup = SparqlFactoryV13.buildGroupPattern([]);

      let bgp:PatternBgp = SparqlFactoryV13.buildBgpPattern([]);

      let beginDateVarName = SparqlFactoryV13.buildVariable(objectVariable.value+`_begin`);
      let endDateVarName = SparqlFactoryV13.buildVariable(objectVariable.value+`_end`);

      bgp.triples.push(
        SparqlFactoryV13.buildTriple(
          startClassVar,
          beginDatePred,
          beginDateVarName
        )
      );

      bgp.triples.push(
        SparqlFactoryV13.buildTriple(
          startClassVar,
          endDatePred,
          endDateVarName
        )
      );

      firstAlternative.patterns.push(bgp);

      // begin date is before given end date
      firstAlternative.patterns.push(SparqlFactoryV13.buildFilterRangeDateOrNumber(null, endDate, beginDateVarName));
      // end date is after given start date
      firstAlternative.patterns.push(SparqlFactoryV13.buildFilterRangeDateOrNumber(startDate, null, endDateVarName));

      // 2. case where the resource has only a start date
      let secondAlternative:PatternGroup = SparqlFactoryV13.buildGroupPattern([]);

      let secondBgp:PatternBgp = SparqlFactoryV13.buildBgpPattern([]);
      secondBgp.triples.push(
        SparqlFactoryV13.buildTriple(
          startClassVar,
          beginDatePred,
          beginDateVarName
        )
      );
      secondAlternative.patterns.push(secondBgp);
      let notExistsEndDate = SparqlFactoryV13.buildNotExistsPattern(
        SparqlFactoryV13.buildGroupPattern(
          [
            SparqlFactoryV13.buildBgpPattern(
              [
                SparqlFactoryV13.buildTriple(
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
      secondAlternative.patterns.push(SparqlFactoryV13.buildFilterRangeDateOrNumber(null, endDate, beginDateVarName));

      // 3. case where the resource has only a end date
      let thirdAlternative:PatternGroup = SparqlFactoryV13.buildGroupPattern([]);
      let thirdBgp:PatternBgp = SparqlFactoryV13.buildBgpPattern([]);
      thirdBgp.triples.push(
        SparqlFactoryV13.buildTriple(
          startClassVar,
          endDatePred,
          endDateVarName
        )
      );
      thirdAlternative.patterns.push(thirdBgp);

      let notExistsBeginDate = SparqlFactoryV13.buildNotExistsPattern(
        SparqlFactoryV13.buildGroupPattern(
          [
            SparqlFactoryV13.buildBgpPattern(
              [
                SparqlFactoryV13.buildTriple(
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
      thirdAlternative.patterns.push(SparqlFactoryV13.buildFilterRangeDateOrNumber(startDate, null, endDateVarName));


      return SparqlFactoryV13.buildUnionPattern([firstAlternative, secondAlternative, thirdAlternative]);
    // we have provided only a start date
    } else if(startDate != null && endDate === null) {

      let endDateVarName = SparqlFactoryV13.buildVariable(objectVariable.value+"_end");
      var bgp = SparqlFactoryV13.buildBgpPattern([
        SparqlFactoryV13.buildTriple(
          startClassVar,
          endDatePred,
          endDateVarName
        )
      ]);

      // end date is after given start date
      var filter = SparqlFactoryV13.buildFilterRangeDateOrNumber(startDate, null, endDateVarName);

      // if the resource has no end date, and has only a start date
      // then it necessarily overlaps with the provided open-ended range
      // so let's avoid this case for the moment
      return SparqlFactoryV13.buildGroupPattern([bgp,filter]);

    // we have provided only a end date
    } else if(startDate === null && endDate != null) {
      let beginDateVarName = SparqlFactoryV13.buildVariable(objectVariable.value+"_begin");
      var bgp = SparqlFactoryV13.buildBgpPattern([
        SparqlFactoryV13.buildTriple(
          startClassVar,
          beginDatePred,
          beginDateVarName
        )
      ]);
      // begin date is before given end date
      var filter = SparqlFactoryV13.buildFilterRangeDateOrNumber(null, endDate, beginDateVarName);

      return SparqlFactoryV13.buildGroupPattern([bgp,filter]);
    }
  };

  static buildDateRangeOrExactDatePattern(
    startDate: TermLiteral,
    endDate: TermLiteral,
    startClassVar: TermVariable,
    beginDatePred: TermIriFull,
    endDatePred: TermIriFull,
    exactDatePred: TermIriFull,
    objectVariable: TermVariable
  ): PatternGroup | PatternUnion {

    if(exactDatePred != null) {

      // first alternative of the union to test exact date
      let exactDateVarName = SparqlFactoryV13.buildVariable(objectVariable.value+"_exact");
      let firstAlternative = SparqlFactoryV13.buildGroupPattern(
        [
          SparqlFactoryV13.buildBgpPattern(
            [
              SparqlFactoryV13.buildTriple(
                startClassVar,
                exactDatePred,
                exactDateVarName
              )
            ]
          ),
          // exact date is within provided date range
          SparqlFactoryV13.buildFilterRangeDateOrNumber(
            startDate,
            endDate,
            exactDateVarName
          )
        ]
      );

      // second alternative to test date range
      let secondAlternative = SparqlFactoryV13.buildDateRangePattern(
        startDate,
        endDate,
        startClassVar,
        beginDatePred,
        endDatePred,
        objectVariable
      );

      // return as an array so that caller can have generic forEach loop to all
      // every element to outer query
      return SparqlFactoryV13.buildUnionPattern([firstAlternative, SparqlFactoryV13.#asGroup(secondAlternative)]);
    } else {
      return SparqlFactoryV13.buildDateRangePattern(
        startDate,
        endDate,
        startClassVar,
        beginDatePred,
        endDatePred,
        objectVariable
      );
    }
  }

  /**
   * The members of a Traqula UNION must be groups, while SparqlJs also accepts other patterns
   * @returns the pattern itself if it is a group, or a group wrapping it otherwise
   */
  static #asGroup(pattern: PatternGroup | PatternUnion): PatternGroup {
    return (pattern.subType === "group")?pattern:SparqlFactoryV13.buildGroupPattern([pattern]);
  }

}
