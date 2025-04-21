import { Order } from "../../SparnaturalQueryIfc";
import { ISparnaturalSpecification } from "../../spec-providers/ISparnaturalSpecification";
import {
  Grouping,
  Ordering,
  SelectQuery,
  Variable,
  VariableExpression,
  VariableTerm,
} from "sparqljs";
import SparnaturalComponent from "../../components/SparnaturalComponent";
import WhereBuilder from "./WhereBuilder";
import SparqlFactory from "./SparqlFactory";
import { DataFactory } from "rdf-data-factory";
import { DraggableComponentState } from "../../components/variables-section/variableorder/DraggableComponent";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import ISpecificationProperty from "../../spec-providers/ISpecificationProperty";

const factory = new DataFactory();

/*
  Reads out the UI and creates the and sparqljs pattern. 
  sparqljs pattern builds pattern structure on top of rdfjs datamodel. see:https://rdf.js.org/data-model-spec/
  It goes recursively through all the grpWrappers and reads out their values.
*/
export default class SparqlGenerator {
  typePredicate: string;
  specProvider: ISparnaturalSpecification;
  prefixes: { [key: string]: string } = {};
  sparnatural: SparnaturalComponent;
  defaultLabelVars: Variable[] = []; // see: #checkForDefaultLabel()
  settings: any;
  constructor(
    sparnatural: SparnaturalComponent,
    specProvider: ISparnaturalSpecification,
    prefixes: { [key: string]: string } = {},
    settings: any
  ) {
    this.sparnatural = sparnatural;
    this.specProvider = specProvider;
    this.prefixes = prefixes;
    this.settings = settings;
  }

  generateQuery(
    variables: Array<DraggableComponentState>,
    order: Order,
    distinct: boolean,
    limit: number
  ): SelectQuery {
    const sparqlJsQuery: SelectQuery = {
      queryType: "SELECT",
      distinct: distinct,
      variables: this.#varsToRDFJS(variables),
      type: "query",
      where: this.#createWhereClause(),
      prefixes: this.prefixes,
      order: this.#orderToRDFJS(
        order,
        factory.variable(variables[0].selectedVariable.variable)
      ),
      limit: limit && limit > 0 ? limit : undefined,
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

    // post processing for defaultlabel property
    if (this.defaultLabelVars.length > 0) {
      this.defaultLabelVars.forEach((defaultLabelVar) =>
        this.#insertDefaultLabelVar(sparqlJsQuery, defaultLabelVar)
      );
    }

    // don't set an order if there is no expression for it
    if (!sparqlJsQuery?.order || !sparqlJsQuery?.order[0]?.expression)
      delete sparqlJsQuery.order;

    // set a GROUP BY based on aggregation expression in the variables
    // add this after defaultLabel var have been inserted, and re-read them from the query
    sparqlJsQuery.group = this.#addGroupBy(
      sparqlJsQuery.variables as Variable[]
    );

    return sparqlJsQuery;
  }

  /**
   * @param variables The list variables of the SELECT query
   * @returns GROUP BY clause if needed, of all non-aggregated variables, or undefined if not needed
   */
  #addGroupBy(variables: Variable[]): Grouping[] {
    if (this.#needsGrouping(variables)) {
      let g: Grouping[] = [];

      variables.forEach((v) => {
        if (!(v as VariableExpression).expression) {
          g.push({
            expression: v as VariableTerm,
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

  #createWhereClause() {
    if (this.sparnatural instanceof SparnaturalComponent) {
      const builder = new WhereBuilder(
        this.sparnatural.BgWrapper.componentsList.rootGroupWrapper,
        this.specProvider,
        this.typePredicate,
        false,
        false,
        this.settings
      );
      builder.build();
      this.defaultLabelVars = builder.getDefaultVars();

      if (builder.getExecutedAfterPtrns().length > 0) {
        // put all normal patterns in a subquery to garantee they are logically executed before
        // and their variables are bound in the rest of the query outside the subquery
        let subquery = SparqlFactory.buildSubQuery(builder.getResultPtrns());
        // and the patterns to be executed after in the normal where clause
        return [subquery, ...builder.getExecutedAfterPtrns()];
      } else {
        return builder.getResultPtrns();
      }
    }
  }

  #varsToRDFJS(variables: Array<DraggableComponentState>): Variable[] {
    let variablesArray: Variable[][] = variables.map((v) => {
      if (v.aggregateFunction) {
        return [
          SparqlFactory.buildAggregateFunctionExpression(
            v.aggregateFunction,
            factory.variable(v.originalVariable.variable),
            factory.variable(v.selectedVariable.variable)
          ),
        ];
      } else {
        // find where the variable comes from
        let specProperty: ISpecificationProperty = undefined;
        this.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
          (grpWrapper: GroupWrapper) => {
            if (
              grpWrapper.CriteriaGroup.EndClassGroup.endClassVal.variable ==
              v.selectedVariable.variable
            ) {
              // check if the spec tells us that begin date / end date / exact date propeties are used
              let propertyType =
                grpWrapper.CriteriaGroup.ObjectPropertyGroup.getTypeSelected();
              specProperty = this.specProvider.getProperty(propertyType);
            }
          }
        ); // end traverse

        // not found as an object, we cannot read the specification property, so return as normal
        if (!specProperty) {
          return [factory.variable(v.selectedVariable.variable)];
        }

        if (
          specProperty.getBeginDateProperty() &&
          specProperty.getEndDateProperty()
        ) {
          let result: Variable[] = [];
          if (specProperty.getBeginDateProperty()) {
            result.push(
              factory.variable(v.selectedVariable.variable + "_begin")
            );
          }
          if (specProperty.getEndDateProperty()) {
            result.push(factory.variable(v.selectedVariable.variable + "_end"));
          }
          if (specProperty.getExactDateProperty()) {
            result.push(
              factory.variable(v.selectedVariable.variable + "_exact")
            );
          }
          return result;
        } else {
          // no begin or date, return as normal
          return [factory.variable(v.selectedVariable.variable)];
        }
      }
    });

    let finalResult: Variable[] = [];
    variablesArray.forEach((varArray: Variable[]) => {
      finalResult.push(...varArray);
    });
    return finalResult;
  }

  // It will be ordered by the Provided variable
  #orderToRDFJS(order: Order, variable: VariableTerm): Ordering[] {
    if (order == Order.DESC || order == Order.ASC) {
      return [
        {
          expression: variable,
          descending: order == Order.DESC ? true : false,
        },
      ];
    } else {
      // no order
      return null;
    }
  }

  // inserts the default label var right after the variable of the same name
  #insertDefaultLabelVar(sparqlQuery: SelectQuery, defaultLabelVar: Variable) {
    var originalVar = (defaultLabelVar as VariableTerm).value.substring(
      0,
      (defaultLabelVar as VariableTerm).value.length - "_label".length
    );
    for (var i = 0; i < sparqlQuery.variables.length; i++) {
      if ((sparqlQuery.variables[i] as VariableTerm).value == originalVar) {
        sparqlQuery.variables.splice(i + 1, 0, defaultLabelVar);
        // don't forget, otherwise infinite loop
        break;
      }
    }
  }
}
