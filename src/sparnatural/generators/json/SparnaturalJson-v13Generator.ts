import SparnaturalComponent from "../../components/SparnaturalComponent";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import { OptionTypes } from "../../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import { DraggableComponentState } from "../../components/variables-section/variableorder/DraggableComponent";

import {
  SparnaturalQuery,
  PatternBgpSameSubject,
  PredicateObjectPair,
  ObjectCriteria,
  TermVariable,
  TermTypedVariable,
  PatternBind,
  ExpressionAggregate,
} from "../../SparnaturalQueryIfcV13";

import {
  labelledCriteriaToFilters,
  labelledCriteriaToFlatValues,
} from "../../querypreloading/QueryAdapterFunc";

import { Order } from "../../SparnaturalQueryIfc";

export class SparnaturalJsonGeneratorV13 {
  sparnatural: SparnaturalComponent;

  constructor(sparnatural: SparnaturalComponent) {
    this.sparnatural = sparnatural;
  }

  generateQuery(
    variables: DraggableComponentState[],
    order: Order,
    distinct: boolean,
    limit: number,
  ): SparnaturalQuery {
    return {
      type: "query",
      subType: "SELECT",
      variables: this.#toVariables(variables),
      distinct: distinct || undefined,
      solutionModifiers: this.#solutionModifiers(order, limit),
      where: this.#buildWhere(
        this.sparnatural.BgWrapper.componentsList.rootGroupWrapper,
      ),
    };
  }

  // -----------------------------------
  // VARIABLES
  // -----------------------------------

  #toVariables(
    vars: DraggableComponentState[],
  ): (TermVariable | PatternBind)[] {
    return vars.map((v) => {
      if (v.aggregateFunction) {
        const expr: ExpressionAggregate = {
          type: "expression",
          subType: "aggregate",
          aggregation: v.aggregateFunction,
          distinct: false,
          expression: [
            {
              type: "term",
              subType: "variable",
              value: v.originalVariable.variable,
            },
          ],
        };

        return {
          type: "pattern",
          subType: "bind",
          expression: expr,
          variable: {
            type: "term",
            subType: "variable",
            value: v.selectedVariable.variable,
          },
        };
      }

      return {
        type: "term",
        subType: "variable",
        value: v.selectedVariable.variable,
      };
    });
  }

  // -----------------------------------
  // WHERE
  // -----------------------------------

  #buildWhere(root: GroupWrapper): PatternBgpSameSubject {
    const subject: TermTypedVariable = {
      type: "term",
      subType: "variable",
      value: root.CriteriaGroup.StartClassGroup.getVarName(),
      rdfType: root.CriteriaGroup.StartClassGroup.getTypeSelected(),
    };

    return {
      type: "pattern",
      subType: "bgpSameSubject",
      subject,
      predicateObjectPairs: this.#collectPairs(root),
    };
  }

  #collectPairs(grp: GroupWrapper): PredicateObjectPair[] {
    const pairs: PredicateObjectPair[] = [];

    const pair = this.#buildPair(grp);
    pairs.push(pair);

    if (grp.andSibling) {
      pairs.push(...this.#collectPairs(grp.andSibling));
    }

    return pairs;
  }

  #buildPair(grp: GroupWrapper): PredicateObjectPair {
    const cg = grp.CriteriaGroup;

    const object: ObjectCriteria = {
      type: "objectCriteria",
      variable: {
        type: "term",
        subType: "variable",
        value: cg.EndClassGroup.getVarName(),
        rdfType: cg.EndClassGroup.getTypeSelected(),
      },
    };

    const widgetValues = cg.endClassWidgetGroup.getWidgetValues();

    object.filters = labelledCriteriaToFilters(widgetValues);
    const flatValues = labelledCriteriaToFlatValues(widgetValues);
    if (flatValues && flatValues.length > 0) {
      object.values = flatValues as any;
    }

    if (grp.whereChild) {
      object.predicateObjectPairs = this.#collectPairs(grp.whereChild);
    }

    const pair: PredicateObjectPair = {
      type: "predicateObjectPair",
      predicate: {
        type: "term",
        subType: "namedNode",
        value: cg.ObjectPropertyGroup.getTypeSelected(),
      },
      object,
    };

    if (grp.optionState === OptionTypes.OPTIONAL) pair.subType = "optional";
    if (grp.optionState === OptionTypes.NOTEXISTS) pair.subType = "notExists";

    return pair;
  }

  // -----------------------------------
  // SOLUTION MODIFIERS
  // -----------------------------------

  #solutionModifiers(order: Order, limit: number) {
    const res: any = {};

    if (order !== Order.NOORDER) {
      const firstVar =
        this.sparnatural.variableSection.variableOrderMenu.draggables[0]?.state
          .selectedVariable.variable;

      if (firstVar) {
        res.order = {
          type: "solutionModifier",
          subType: "order",
          orderDefs: [
            {
              descending: order === Order.DESC,
              expression: {
                type: "term",
                subType: "variable",
                value: firstVar,
              },
            },
          ],
        };
      }
    }

    if (limit > 0) {
      res.limitOffset = {
        type: "solutionModifier",
        subType: "limitOffset",
        limit,
      };
    }

    return res;
  }
}
