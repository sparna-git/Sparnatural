import {
  SparnaturalQuery,
  TermVariable,
  PatternBind,
  SelectVariable,
  PredicateObjectPair,
  TermTypedVariable,
} from "../../../SparnaturalQueryIfc-v13";
import {
  AstFactory,
  Ordering,
  Pattern,
  PatternBind as SparqlPatternBind,
  QuerySelect,
  SolutionModifierGroup,
  SolutionModifierOrder,
  TermVariable as SparqlTermVariable,
} from "@traqula/rules-sparql-1-1";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import SparqlFactoryV13 from "./SparqlFactoryV13";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";
import QueryWhereTranslatorV13 from "./QueryWhereTranslatorV13";
import { Model } from "rdf-shacl-commons";
import { ISpecificationEntity } from "../../../spec-providers/ISpecificationEntity";
import { SparnaturalQueryTraversal, SparnaturalQueryUtils } from "./SparnaturalQueryUtils";

const F = new AstFactory();

// a variable in the SELECT clause : either a simple variable, or an aggregation (... AS ?var)
type Variable = SparqlTermVariable | SparqlPatternBind;

export class JsonV13SparqlTranslator {

  specProvider: ISparnaturalSpecification;
  prefixes: { [key: string]: string } = {};
  jsonQuery: SparnaturalQuery;
  settings: any;

  defaultLabelVars: SparqlTermVariable[] = [];

  constructor(
    // the Sparnatural configuration
    specProvider: ISparnaturalSpecification,
    // settings
    settings: any,
  ) {
    this.specProvider = specProvider;
    this.settings = settings;
  }

  /**
   * @param jsonQuery the sparnaturalV13 JSON query
   * @returns a SPARQL query translated from the Sparnatural JSON query structure
   */
  generateQuery(jsonQuery: SparnaturalQuery): QuerySelect {
    // make a deep copy of the query since we will expand it during SPARQL
    // Warning : everything below should now operate on this.jsonQuery, and not on jsonQuery
    this.jsonQuery = (JSON.parse(JSON.stringify(jsonQuery)));

    SparnaturalQueryUtils.addKeyInfoSelection(this.jsonQuery, this.specProvider);

    // sets a limit if provided, otherwise leave to undefined
    const limit =
      this.jsonQuery.solutionModifiers?.limitOffset?.limit && this.jsonQuery.solutionModifiers?.limitOffset?.limit > 0
        ? this.jsonQuery.solutionModifiers.limitOffset.limit
        : undefined;

    const traqulaQuery: QuerySelect = F.querySelect({
      context: Object.entries(this.prefixes).map(([prefix, iri]) =>
        F.contextDefinitionPrefix(F.gen(), prefix, SparqlFactoryV13.buildNamedNode(iri))
      ),
      // Traqula only sets distinct when it is true
      ...(this.jsonQuery.distinct ? { distinct: true } : {}),
      variables: this.#varsToRDFJS(this.jsonQuery.variables),
      where: SparqlFactoryV13.buildGroupPattern(this.#createWhereClause()),
      solutionModifiers: {
        order: this.#orderFromSolutionModifiers(this.jsonQuery),
        limitOffset: limit ? F.solutionModifierLimitOffset(limit, undefined, F.gen()) : undefined,
      },
      datasets: F.datasetClauses([], F.gen()),
    }, F.gen());

    if (this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach((v) => {
        let varName = v.value;

        // TODO : special - we present insertion of deffault label var if it was already used in an aggregation
        // this shouldn't happen if the extrac variables were inserted as a pre-process in the query before converting to SPARQL
        let doInsert = true;
        if(varName.endsWith("_label")) {
          varName = varName.substring(0, varName.length - "_label".length);
          if (SparnaturalQueryUtils.isVarRequiresAggregationOnLabel(this.jsonQuery, varName, this.specProvider)) {
            doInsert = false;
          }
        }
        if(doInsert) {
          this.#insertExtraVariableInSelect(traqulaQuery, v);
        }
      });
    }

    if (!traqulaQuery.solutionModifiers.order) delete traqulaQuery.solutionModifiers.order;
    if (!traqulaQuery.solutionModifiers.limitOffset) delete traqulaQuery.solutionModifiers.limitOffset;

    // set a GROUP BY based on aggregation expression in the variables
    // add this after defaultLabel var have been inserted, and re-read them from the query
    const group = this.#addGroupBy(
      traqulaQuery.variables as Variable[],
    );
    if (group) traqulaQuery.solutionModifiers.group = group;

    return traqulaQuery;
  }

  /**
   * @param variables The list variables of the SELECT query
   * @returns GROUP BY clause if needed, of all non-aggregated variables, or undefined if not needed
   */
  #addGroupBy(variables: Variable[]): SolutionModifierGroup | undefined {
    if (this.#needsGrouping(variables)) {
      let g: SparqlTermVariable[] = [];

      variables.forEach((v) => {
        if (!(v as SparqlPatternBind).expression) {
          g.push(v as SparqlTermVariable);
        }
      });

      return F.solutionModifierGroup(g, F.gen());
    } else {
      // no aggregation, or only one column, grouping is undefined
      return undefined;
    }
  }

  #needsGrouping(variables: Variable[]): boolean {
    return variables.find((v) => (v as SparqlPatternBind).expression) &&
      variables.length > 1
      ? true
      : false;
  }

  /**
   * Generates the WHERE clause of the Traqula query from the original JSON structure
   * @returns an array of Traqula Pattern representing the complete content of the WHERE clause
   */
  #createWhereClause(): Pattern[] {
    const whereBuilder = new QueryWhereTranslatorV13(this);
    whereBuilder.build();
    this.defaultLabelVars = whereBuilder.getDefaultVars();
    return whereBuilder.getResultPtrns();
  }

  /**
   * Converts SparnaturalQuery variables to Traqula Variable or Aggregate expressions
   * @param variables The list of variables from SparnaturalQuery
   * @returns The list of variables as Traqula Variable or Aggregate expressions
   */
  #varsToRDFJS(variables: Array<TermVariable | PatternBind>): QuerySelect["variables"] {

    const where = this.jsonQuery.where;
    let varName:string;

    const variablesArray: Variable[][] = variables.map((v) => {    

      if (v.type === "pattern" && v.subType === "bind") {
       
        varName = v.expression.expression[0].value;

        // Vérifier si cette variable a un default label généré
        // en cherchant dans les branches la variable et son type
        let concatOnLabel = SparnaturalQueryUtils.isVarRequiresAggregationOnLabel(this.jsonQuery, varName, this.specProvider);
        const actualVar = concatOnLabel ? varName + "_label" : varName;

        return [
          SparqlFactoryV13.buildAggregateFunctionExpression(
            v.expression.aggregation,
            SparqlFactoryV13.buildVariable(actualVar),
            SparqlFactoryV13.buildVariable(v.variable.value),
          ),
        ];
      }
      else {
        varName = v.value;

        const findVarProperty = (
            pairs: PredicateObjectPair[],
            varName: string,
        ): ISpecificationProperty | undefined => {
          for (const pair of pairs) {
            if (pair.object?.variable?.value === varName) return this.specProvider.getProperty(pair.predicate.value);
            if (pair.object?.predicateObjectPairs) {
              const result = findVarProperty(pair.object?.predicateObjectPairs, varName);
              if (result) return result;
            }
          }
          return undefined;
        };

        // chercher la propriété qui produit cette variable
        let specProperty: ISpecificationProperty | undefined = findVarProperty(where.predicateObjectPairs, varName);

        if (!specProperty) {
          return [SparqlFactoryV13.buildVariable(varName)];
        }

        if (
          specProperty.getBeginDateProperty() ||
          specProperty.getEndDateProperty() ||
          specProperty.getExactDateProperty()
        ) {
          const result: Variable[] = [];

          if (specProperty.getBeginDateProperty()) {
            result.push(SparqlFactoryV13.buildVariable(`${varName}_begin`));
          }
          if (specProperty.getEndDateProperty()) {
            result.push(SparqlFactoryV13.buildVariable(`${varName}_end`));
          }
          if (specProperty.getExactDateProperty()) {
            result.push(SparqlFactoryV13.buildVariable(`${varName}_exact`));
          }

          return result;
        }

        return [SparqlFactoryV13.buildVariable(varName)];
      }
    });

    const finalResult: Variable[] = [];
    variablesArray.forEach((arr) => finalResult.push(...arr));

    // an empty SELECT clause is not valid SPARQL, select everything instead
    if (finalResult.length === 0) {
      return [F.wildcard(F.gen())];
    }

    return finalResult;
  }

  /**
   * ordering from solution modifiers
   * @param query The SparnaturalQuery to extract the ordering from
   * @returns ORDER BY clause if needed, or undefined if not needed
   */

  #orderFromSolutionModifiers(query: SparnaturalQuery): SolutionModifierOrder | undefined {
    const order = query.solutionModifiers?.order;
    if (!order || order.orderDefs.length === 0) return undefined;

    return F.solutionModifierOrder(
      order.orderDefs.map((o): Ordering => ({
        expression: SparqlFactoryV13.buildVariable(o.expression.value),
        descending: o.descending === true,
        loc: F.gen(),
      })),
      F.gen()
    );
  }

  /**
   * Inserts the provided variable, having the name "xxx_yyyy", after the variable named "xxx"
   * @param sparqlQuery The Traqula query
   * @param extraVar The new variable, ending in xxx_yyyy, typically default label var xxx_label, to insert
   */
  #insertExtraVariableInSelect(sparqlQuery: QuerySelect, extraVar: SparqlTermVariable) {
    // reconstruct the original var name by removing "_label" suffix
    var varName = extraVar.value;

    if(varName.includes("_")) {
      let originalVar = varName.split("_")[0];

      let found:boolean = false;
      for (var i = 0; i < sparqlQuery.variables.length; i++) {
        // find variable with the original name
        if (
          (sparqlQuery.variables[i] as SparqlTermVariable).value == originalVar
        ) {
          // insert the default label var after this one
          (sparqlQuery.variables as Variable[]).splice(i + 1, 0, extraVar);
          found = true;
          // don't forget, otherwise infinite loop
          break;
        }
      }

      if(!found) {
        // insert at the end
        (sparqlQuery.variables as Variable[]).push(extraVar);
      }
    } else {
      // if the var name doesn't follow the expected pattern, just add it at the end
      (sparqlQuery.variables as Variable[]).push(extraVar);
    }
  }


  isVarSelected(varName: string): boolean {
    return SparnaturalQueryUtils.isVarSelected(this.jsonQuery, varName);
  }

  isObjectVarHasChildren(varName: string): boolean {
    let criteria = SparnaturalQueryUtils.findObjectCriteriaByObjectVarName(this.jsonQuery, varName);
    return (!!criteria && !!criteria.predicateObjectPairs && criteria.predicateObjectPairs.length > 0);
  }

  isVarAggregated(varName: string): boolean {
    return (
      this.isVarSelected(varName)
      &&
      (SparnaturalQueryUtils.findSelectedVariableByName(this.jsonQuery, varName) as PatternBind)?.expression !== undefined
    );
  }

  isVarAggregatedGroupConcat(varName: string): boolean {
    return (
      this.isVarSelected(varName)
      &&
      (SparnaturalQueryUtils.findSelectedVariableByName(this.jsonQuery, varName) as PatternBind)?.expression !== undefined
      &&
      (SparnaturalQueryUtils.findSelectedVariableByName(this.jsonQuery, varName) as PatternBind)?.expression.aggregation.toLowerCase() === "group_concat"
    );
  }


  /**
   * @returns A map with the max variable index for each type, based on the variables used in the current SPARQL query. 
   */
  getMaxVariableIndexByTypes(): Map<string, number> {
    let maxVariableIndexPerType = new Map<string, number>();
    const processTypeVar = (type?: string, variable?: string) => {
      if (!type || !variable) return;

      // If variable name ends with _<number>, extract and keep the max per type
      const m = variable.match(/_(\d+)$/);
      if (m) {
        const index = parseInt(m[1], 10);
        if (maxVariableIndexPerType.has(type)) {
          if ((maxVariableIndexPerType.get(type) as number) < index) {
            maxVariableIndexPerType.set(type, index);
          }
        } else {
          maxVariableIndexPerType.set(type, index);
        }
      }

      // Also consider the base variable (without index) as 1 if it matches the type-based base name
      const baseVar = Model.getSparqlVariableNameFromUri(type);
      if (variable === baseVar && !maxVariableIndexPerType.has(type)) {
        maxVariableIndexPerType.set(type, 1);
      }
    };

    SparnaturalQueryTraversal.traverse(this.jsonQuery, {
      subject: (s) => processTypeVar(s?.rdfType, s?.value),
      objectCriteria: (obj) => processTypeVar(obj?.variable?.rdfType, obj?.variable?.value),
    });

    return maxVariableIndexPerType;
  }

  generateNewVariableName(type: string): string {
    const maxVariableIndexPerType = this.getMaxVariableIndexByTypes();
    const currentTypeIndex = maxVariableIndexPerType.get(type) || 0;

    if (currentTypeIndex === 0) {
      return `${Model.getSparqlVariableNameFromUri(type)}`;
    } else {
      return `${Model.getSparqlVariableNameFromUri(type)}_${currentTypeIndex + 1}`;
    }
  }


}
