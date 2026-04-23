import {
  SparnaturalQuery,
  TermVariable,
  PatternBind,
  SelectVariable,
  PredicateObjectPair,
  TermTypedVariable,
} from "../../../SparnaturalQueryIfc-v13";
import { VariableExpression, VariableTerm } from "../../../SparnaturalQueryIfc";
import { Pattern, VariableTerm as SparqlVariableTerm } from "sparqljs";
import { VariableExpression as SparqlVariableExpression } from "sparqljs";
import { ISparnaturalSpecification } from "../../../spec-providers/ISparnaturalSpecification";
import { Grouping, Ordering, SelectQuery, Variable } from "sparqljs";
import SparqlFactory from "../SparqlFactory";
import { DataFactory } from "rdf-data-factory";
import ISpecificationProperty from "../../../spec-providers/ISpecificationProperty";
import QueryWhereTranslatorV13 from "./QueryWhereTranslatorV13";
import { Model } from "rdf-shacl-commons";
import SparnaturalQueryTraversalV13 from "./SparnaturalQueryTraversal";
import { ISpecificationEntity } from "../../../spec-providers/ISpecificationEntity";

const factory = new DataFactory();

export class JsonV13SparqlTranslator {

  specProvider: ISparnaturalSpecification;
  prefixes: { [key: string]: string } = {};
  jsonQuery: SparnaturalQuery;
  settings: any;

  defaultLabelVars: Variable[] = [];
  extraPropertiesVars: Variable[] = [];

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
  generateQuery(jsonQuery: SparnaturalQuery): SelectQuery {
    this.jsonQuery = jsonQuery;

    const sparqlJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: jsonQuery.distinct,
      type: "query",
      variables: this.#varsToRDFJS(jsonQuery.variables),
      where: this.#createWhereClause(),
      prefixes: this.prefixes,
      order: this.#orderFromSolutionModifiers(jsonQuery),
      // sets a limit if provided, otherwise leave to undefined
      limit:
        jsonQuery.solutionModifiers?.limitOffset?.limit && jsonQuery.solutionModifiers?.limitOffset?.limit > 0
          ? jsonQuery.solutionModifiers.limitOffset.limit
          : undefined,
    };

    // if the RdfJsQuery contains empty 'where' array, then the generator crashes.
    // create query with no triples
    if (sparqlJsQuery.where?.length === 0) {
      sparqlJsQuery.where = [
        {
          type: "bgp",
          triples: [],
        },
      ];
    }

    if (this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach((v) =>
        this.#insertExtraVariableInSelect(sparqlJsQuery, v),
      );
    }

    if(this.extraPropertiesVars.length > 0) {
      this.extraPropertiesVars.forEach((v) =>
        this.#insertExtraVariableInSelect(sparqlJsQuery, v)
      );
    }

    if (!sparqlJsQuery.order) delete sparqlJsQuery.order;
    if (!sparqlJsQuery.limit) delete sparqlJsQuery.limit;

    // set a GROUP BY based on aggregation expression in the variables
    // add this after defaultLabel var have been inserted, and re-read them from the query
    sparqlJsQuery.group = this.#addGroupBy(
      sparqlJsQuery.variables as Variable[],
    );

    return sparqlJsQuery;
  }

  /**
   * @param variables The list variables of the SELECT query
   * @returns GROUP BY clause if needed, of all non-aggregated variables, or undefined if not needed
   */
  #addGroupBy(variables: Variable[]): Grouping[] | undefined {
    if (this.#needsGrouping(variables)) {
      let g: Grouping[] = [];

      variables.forEach((v) => {
        if (!(v as SparqlVariableExpression).expression) {
          g.push({
            expression: v as SparqlVariableTerm,
          });
        }
      });

      return g;
    } else {
      // no aggregation, or only one column, grouping is undefined
      return undefined;
    }
  }

  #needsGrouping(variables: Variable[]): boolean {
    return variables.find((v) => (v as VariableExpression).expression) &&
      variables.length > 1
      ? true
      : false;
  }

  /**
   * Generates the WHERE clause of the SparqlJs query from the original JSON structure
   * @returns an array of SparqlJs Pattern representing the complete content of the WHERE clause
   */

  #createWhereClause(): Pattern[] {
    const whereBuilder = new QueryWhereTranslatorV13(this);
    whereBuilder.build();
    this.defaultLabelVars = whereBuilder.getDefaultVars();
    this.extraPropertiesVars = whereBuilder.getExtraPropertiesVars();
    return whereBuilder.getResultPtrns();
  }

  // a voir encore
  /**
   * Converts SparnaturalQuery variables to SparqlJs Variable or Aggregate expressions
   * @param variables The list of variables from SparnaturalQuery
   * @returns The list of variables as SparqlJs Variable or Aggregate expressions
   */

  #varsToRDFJS(variables: Array<TermVariable | PatternBind>): Variable[] {
    const where = this.jsonQuery.where;
    const pairs = where?.predicateObjectPairs ?? [];

    let varName:string;
    

    const variablesArray: Variable[][] = variables.map((v) => {
      

      const findVarEntity = (
          subject: TermTypedVariable,
          pairs: PredicateObjectPair[],
          varName: string,
      ): ISpecificationEntity | undefined => {
        for (const pair of pairs) {
          if (pair.object?.variable?.value === varName) return this.specProvider.getEntity(pair.object?.variable?.rdfType);
          // also look in subject
          if(subject.value === varName ) return this.specProvider.getEntity(subject.rdfType);
          if (pair.object?.predicateObjectPairs) {
            const result = findVarEntity(pair.object.variable, pair.object?.predicateObjectPairs, varName);
            if (result) return result;
          }
        }
        return undefined;
      };

      if (v.type === "pattern" && v.subType === "bind") {

        varName = v.expression.expression[0].value;

        // Vérifier si cette variable a un default label généré
        // en cherchant dans les branches la variable et son type
        let concatOnLabel = false;

        // seulement si c'est un group_concat
        if(v.expression.aggregation.toLowerCase() === "group_concat") {
          // chercher le type de cette variable
          let entity:ISpecificationEntity | undefined = findVarEntity(where.subject, where.predicateObjectPairs, varName);

          if (
            entity
            &&
            !entity.isLiteralEntity()
            &&
            entity.getDefaultLabelProperty()
          ) {
            concatOnLabel = true;
          }
        }

        const actualVar = concatOnLabel ? varName + "_label" : varName;

        return [
          SparqlFactory.buildAggregateFunctionExpression(
            v.expression.aggregation,
            factory.variable(actualVar),
            factory.variable(v.variable.value),
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
          return [factory.variable(varName)];
        }

        if (
          specProperty.getBeginDateProperty() ||
          specProperty.getEndDateProperty() ||
          specProperty.getExactDateProperty()
        ) {
          const result: Variable[] = [];

          if (specProperty.getBeginDateProperty()) {
            result.push(factory.variable(`${varName}_begin`));
          }
          if (specProperty.getEndDateProperty()) {
            result.push(factory.variable(`${varName}_end`));
          }
          if (specProperty.getExactDateProperty()) {
            result.push(factory.variable(`${varName}_exact`));
          }

          return result;
        }

        return [factory.variable(varName)];
      }


    });

    const finalResult: Variable[] = [];
    variablesArray.forEach((arr) => finalResult.push(...arr));

    return finalResult;
  }

  /**
   * ordering from solution modifiers
   * @param query The SparnaturalQuery to extract the ordering from
   * @returns ORDER BY clause if needed, or undefined if not needed
   */

  #orderFromSolutionModifiers(query: SparnaturalQuery): Ordering[] | undefined {
    const order = query.solutionModifiers?.order;
    if (!order || order.orderDefs.length === 0) return undefined;

    return order.orderDefs.map((o) => ({
      expression: factory.variable(o.expression.value),
      descending: o.descending,
    }));
  }

  /**
   * Inserts the provided variable, having the name "xxx_yyyy", after the variable named "xxx"
   * @param sparqlQuery The SparqlJs query
   * @param extraVar The new variable, ending in xxx_yyyy, typically default label var xxx_label, to insert
   */
  #insertExtraVariableInSelect(sparqlQuery: SelectQuery, extraVar: Variable) {
    // reconstruct the original var name by removing "_label" suffix
    var varName;
    if((extraVar as any)["expression"]) {
      varName = (extraVar as VariableExpression).expression.expression.value;
    } else {
      varName = (extraVar as VariableTerm).value;
    }

    if(varName.includes("_")) {
      let originalVar = varName.split("_")[0];

      let found:boolean = false;
      for (var i = 0; i < sparqlQuery.variables.length; i++) {
        // find variable with the original name
        if (
          (sparqlQuery.variables[i] as SparqlVariableTerm).value == originalVar
        ) {
          // insert the default label var after this one
          sparqlQuery.variables.splice(i + 1, 0, extraVar);
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
    return JsonV13SparqlTranslator.isVarSelected(this.jsonQuery, varName);
  }

  isVarAggregated(varName: string): boolean {
    return (
      this.isVarSelected(varName)
      &&
      (JsonV13SparqlTranslator.findSelectedVariableByName(this.jsonQuery, varName) as PatternBind)?.expression !== undefined
    );
  }

  isVarAggregatedGroupConcat(varName: string): boolean {
    return (
      this.isVarSelected(varName)
      &&
      (JsonV13SparqlTranslator.findSelectedVariableByName(this.jsonQuery, varName) as PatternBind)?.expression !== undefined
      &&
      (JsonV13SparqlTranslator.findSelectedVariableByName(this.jsonQuery, varName) as PatternBind)?.expression.aggregation.toLowerCase() === "group_concat"
    );
  }

  getExtraPropertyRoles(varName: string): string[] {
    let selectVar:SelectVariable | undefined = JsonV13SparqlTranslator.findSelectedVariableByName(this.jsonQuery, varName);
    if(selectVar && selectVar.with) {
      return selectVar.with.map((t) => t.value);
    }
    return [];
  }

  /**
   * @param query The query to test
   * @param varName The variable to test the selection for
   * @returns true if the varName is selected in the query
   */
  static isVarSelected(query: SparnaturalQuery, varName: string): boolean {
    let result = JsonV13SparqlTranslator.findSelectedVariableByName(query, varName) !== undefined;
    return result;
  }

  static findSelectedVariableByName(query: SparnaturalQuery, varName: string): SelectVariable | undefined {
    return (
      query.variables.find((v) => {
        // PatternBind (aggregate)
        if (v.type === "pattern" && v.subType === "bind") {
          if(v.expression.expression[0].value === varName) return true;        
        }
        // TermVariable
        return (
          v.type === "term" && v.subType === "variable" && v.value === varName
        );
      }) as SelectVariable
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

    SparnaturalQueryTraversalV13.traverse(this.jsonQuery, {
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
