import ObjectPropertyGroup from "../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import ClassTypeId from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/ClassTypeId";
import EndClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import StartClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { SelectedVal } from "../components/SelectedVal";
import SparnaturalComponent from "../components/SparnaturalComponent";

import {
  translateObjectValues,
  translateFilters,
  patternBindToVariableExpression,
} from "./QueryAdapterFunc";

import { LabelledCriteria, Criteria, Order } from "../SparnaturalQueryIfc";

import {
  SparnaturalQuery,
  PatternBind,
  TermVariable,
  TermTypedVariable,
  PredicateObjectPair,
} from "../SparnaturalQueryIfc-v13";

export default class QueryLoader {
  static sparnatural: SparnaturalComponent;
  static query: SparnaturalQuery;

  static setSparnatural(sparnatural: SparnaturalComponent) {
    this.sparnatural = sparnatural;
  }

  // Load a query in the visual query builder
  static loadQuery(query: SparnaturalQuery) {
    this.query = query;
    // set Sparnatural quiet so it does not emit the update callbacks
    this.sparnatural.setQuiet(true);
    // first reset the current query
    this.sparnatural.BgWrapper.resetCallback();
    const clone = JSON.parse(JSON.stringify(query)) as SparnaturalQuery;
    // build Sparnatural from query
    const varMapping = this.#buildSparnatural(this.sparnatural, clone);
    // set the correct variable names
    this.#updateNamingOfVariables(varMapping);
    // set the correct ordering of the draggables
    this.#updateOrderingOfVariables();
    // then reset the quiet flag
    this.sparnatural.setQuiet(false);
    this.sparnatural.html[0].dispatchEvent(new CustomEvent("generateQuery"));
    this.sparnatural.html[0].dispatchEvent(
      new CustomEvent("redrawBackgroundAndLinks"),
    );
  }

  // Build Sparnatural UI from the SparnaturalQuery
  static #buildSparnatural(
    sparnatural: SparnaturalComponent,
    query: SparnaturalQuery,
  ): Map<string, string> {
    const varMapping = new Map<string, string>();

    if (!query?.where || query.where.subType !== "bgpSameSubject") {
      throw Error("Query.where is missing or not a bgpSameSubject");
    }

    // catch subject and predicateObjectPairs from the query
    const subject = query.where.subject;
    const pairs = [...(query.where.predicateObjectPairs ?? [])];
    if (pairs.length === 0) throw Error("No predicateObjectPairs detected");

    const rootGrpWrapper =
      sparnatural.BgWrapper.componentsList.rootGroupWrapper;

    // root = first pair
    const first = pairs.shift() as PredicateObjectPair;
    const localMap1 = this.#buildCriteriaGroupFromPair(
      rootGrpWrapper,
      subject,
      first,
    );
    localMap1.forEach((v, k) => varMapping.set(k, v));

    // other top-level pairs = AND siblings
    let parent = rootGrpWrapper;
    pairs.forEach((p) => {
      this.#clickOn(parent.criteriaGroup.actionsGroup.actions.actionAnd.btn);
      const localMap = this.#buildCriteriaGroupFromPair(
        parent.andSibling,
        subject,
        p,
      );
      localMap.forEach((v, k) => varMapping.set(k, v));
      parent = parent.andSibling;
    });

    // unselect root subject eye if not selected in query
    if (!this.#hasSelectedVar(query.variables, subject.value)) {
      this.#clickOn(
        (
          rootGrpWrapper.criteriaGroup.startClassGroup
            .inputSelector as ClassTypeId
        )?.selectViewVariableBtn?.widgetHtml,
      );
    }

    return varMapping;
  }

  // Build a CriteriaGroup from a PredicateObjectPair
  static #buildCriteriaGroupFromPair(
    grpWrapper: GroupWrapper,
    subject: TermTypedVariable,
    pair: PredicateObjectPair,
  ): Map<string, string> {
    const varMapping = new Map<string, string>();
    const obj = pair.object;

    // Start class (subject rdfType)
    const startClassVal: SelectedVal = {
      type: subject.rdfType,
      variable: subject.value,
    };

    if (!grpWrapper.criteriaGroup.startClassGroup.startClassVal.type) {
      this.#setSelectedValue(
        grpWrapper.criteriaGroup.startClassGroup,
        subject.rdfType,
      );
    }

    // This is for cases where the variable name has been manually changed in the query
    // and is not one of the selected variables in the result set
    grpWrapper.criteriaGroup.startClassGroup.startClassVal = startClassVal;

    varMapping.set(
      grpWrapper.criteriaGroup.startClassGroup.startClassVal.variable,
      subject.value,
    );

    // End class (object rdfType)
    const endClassVal: SelectedVal = {
      type: obj.variable.rdfType,
      variable: obj.variable.value,
    };

    this.#setSelectedValue(
      grpWrapper.criteriaGroup.endClassGroup,
      obj.variable.rdfType,
    );

    // This is for cases where the variable name has been manually changed in the query
    // and is not one of the selected variables in the result set
    grpWrapper.criteriaGroup.endClassGroup.endClassVal = endClassVal;

    varMapping.set(
      grpWrapper.criteriaGroup.endClassGroup.endClassVal.variable,
      obj.variable.value,
    );

    // predicate
    this.#setSelectedValue(
      grpWrapper.criteriaGroup.objectPropertyGroup,
      pair.predicate.value,
    );

    // ---------- VALUES / FILTERS translation to v1-style widget inputs ----------
    const widgetInputs: LabelledCriteria<Criteria>[] = [];

    // 1) filters -> labelledCriteria(criteria: Date/Number/Search/Map)
    if (obj.filters?.length) {
      widgetInputs.push(...translateFilters(obj.filters));
    }

    // 2) values -> labelledCriteria(criteria: RdfTermCriteria)
    if (obj.values?.length) {
      widgetInputs.push(...translateObjectValues(obj.variable.value, obj));
    }

    // render widget inputs (same logic as v1)
    if (widgetInputs.length > 0) {
      widgetInputs.forEach((input) => {
        const parsedVal =
          grpWrapper.criteriaGroup.endClassGroup.editComponents.widgetWrapper.widgetComponent.parseInput(
            input,
          );

        if (
          grpWrapper.criteriaGroup.endClassWidgetGroup.widgetValues.length > 0
        ) {
          this.#clickOn(
            grpWrapper.criteriaGroup.endClassWidgetGroup.addWidgetValueBtn.html,
          );
        }

        grpWrapper.criteriaGroup.endClassGroup.editComponents.widgetWrapper.widgetComponent.triggerRenderWidgetVal(
          parsedVal,
        );
      });
    }

    // if no values/filters and no children => Any
    const hasNoValuesOrFilters =
      (!obj.values || obj.values.length === 0) &&
      (!obj.filters || obj.filters.length === 0);

    const hasNoChildren =
      !obj.predicateObjectPairs || obj.predicateObjectPairs.length === 0;

    if (hasNoValuesOrFilters && hasNoChildren) {
      grpWrapper.criteriaGroup.endClassGroup.editComponents.onSelectAll();
    }

    // options v13
    this.#triggerOptions(grpWrapper, this.#mapPairSubTypeToOptions(pair));

    // children recursion (WHERE)
    if (obj.predicateObjectPairs?.length) {
      this.#clickOn(
        grpWrapper.criteriaGroup.endClassGroup.editComponents.actionWhere.btn,
      );

      const childrenPairs = [...obj.predicateObjectPairs];

      const firstChild = childrenPairs.shift() as PredicateObjectPair;
      let localMap = this.#buildCriteriaGroupFromPair(
        grpWrapper.whereChild,
        obj.variable,
        firstChild,
      );
      localMap.forEach((v, k) => varMapping.set(k, v));

      let parent = grpWrapper.whereChild;
      childrenPairs.forEach((cp) => {
        this.#clickOn(parent.criteriaGroup.actionsGroup.actions.actionAnd.btn);
        localMap = this.#buildCriteriaGroupFromPair(
          parent.andSibling,
          obj.variable,
          cp,
        );
        localMap.forEach((v, k) => varMapping.set(k, v));
        parent = parent.andSibling;
      });
    }

    // eye button (same behaviour: only end class toggled)
    this.#setSelectViewVariableBtn(
      startClassVal,
      grpWrapper.criteriaGroup.startClassGroup,
      endClassVal,
      grpWrapper.criteriaGroup.endClassGroup,
    );

    return varMapping;
  }

  // set selected options (optional, notExists)
  static #triggerOptions(
    grpWrapper: GroupWrapper,
    branchLike: { optional?: boolean; notExists?: boolean },
  ) {
    if (
      branchLike.notExists &&
      grpWrapper.currentOptionState != OptionTypes.NOTEXISTS
    ) {
      this.#clickOn(
        grpWrapper.criteriaGroup.optionsGroup.optionalArrow.widgetHtml,
      );
      this.#clickOn(
        grpWrapper.criteriaGroup.optionsGroup.NotExistsComponent.html,
      );
    }
    if (branchLike.optional && grpWrapper.currentOptionState != OptionTypes.OPTIONAL) {
      this.#clickOn(
        grpWrapper.criteriaGroup.optionsGroup.optionalArrow.widgetHtml,
      );
      this.#clickOn(
        grpWrapper.criteriaGroup.optionsGroup.OptionalComponent.html,
      );
    }
  }

  static #mapPairSubTypeToOptions(pair: PredicateObjectPair): {
    optional?: boolean;
    notExists?: boolean;
  } {
    switch (pair.subType) {
      case "optional":
        return { optional: true };
      case "notExists":
        return { notExists: true };
      default:
        return { optional: false, notExists: false };
    }
  }

  // set selected value and submit
  static #setSelectedValue(
    component: StartClassGroup | EndClassGroup | ObjectPropertyGroup,
    value: string,
  ) {
    component.inputSelector.setSelected(value);
    component.inputSelector.submitSelected();
  }

  static #setSelectViewVariableBtn(
    startClassVal: SelectedVal,
    startClassComponent: StartClassGroup,
    endClassVal: SelectedVal,
    endClassComponent: EndClassGroup,
  ) {
    if (this.#hasSelectedVar(this.query.variables, endClassVal.variable)) {
      this.#clickOn(
        (endClassComponent.inputSelector as ClassTypeId)?.selectViewVariableBtn
          ?.widgetHtml,
      );
    }
  }

  // Update the ordering of variables in the UI
  static #updateOrderingOfVariables() {
    const varMenu = this.sparnatural.variableSection.variableOrderMenu;

    this.query.variables.forEach((v) => {
      varMenu.draggables.forEach((d) => {
        const varName = this.#getSelectedVarNameFromSelectItem(v);

        if (d.state.selectedVariable.variable === varName) {
          varMenu.removeDraggableByVarName(varName);
          const newDraggable = varMenu.addDraggableComponent(
            d.state.selectedVariable,
          );

          if (this.#isBind(v)) {
            newDraggable.loadAggregatedVariable(
              patternBindToVariableExpression(v),
            );
          }
        }
      });
    });

    const variableSortOption =
      this.sparnatural.variableSection.variableSortOption;

    const orderDef = this.query.solutionModifiers?.order?.orderDefs?.[0];
    if (!orderDef) {
      variableSortOption.changeSortOrderCallBack(Order.NOORDER);
      return;
    }

    variableSortOption.changeSortOrderCallBack(
      orderDef.descending ? Order.DESC : Order.ASC,
    );
  }

  // Update the naming of variables in the UI
  static #updateNamingOfVariables(varNameMapping: Map<string, string>) {
    const varMenu = this.sparnatural.variableSection.variableOrderMenu;

    this.query.variables.forEach((v) => {
      varMenu.draggables.forEach((d) => {
        const targetVarName = this.#getSelectedVarNameFromSelectItem(v);

        if (
          varNameMapping.get(d.state.selectedVariable.variable) ===
          targetVarName
        ) {
          d.setVarName(targetVarName);
        }
      });
    });
  }

  // Check if a variable is selected in the query variables
  static #hasSelectedVar(
    vars: SparnaturalQuery["variables"],
    varName: string,
  ): boolean {
    let result = false;

    vars.forEach((v) => {
      if (this.#isBind(v)) {
        // keep same old behaviour: consider the aggregated INPUT variable as "selected"
        const aggregatedInputVar = v.expression?.expression?.[0]?.value;
        if (aggregatedInputVar === varName) result = true;
      } else {
        if (v.value === varName) result = true;
      }
    });

    return result;
  }

  static #isBind(v: TermVariable | PatternBind): v is PatternBind {
    return (
      (v as PatternBind).type === "pattern" &&
      (v as PatternBind).subType === "bind"
    );
  }

  // Get the variable name from a select item (TermVariable or PatternBind)
  static #getSelectedVarNameFromSelectItem(
    v: TermVariable | PatternBind,
  ): string {
    if (this.#isBind(v)) {
      return v.expression?.expression?.[0]?.value ?? v.variable.value;
    }
    return v.value;
  }

  static #clickOn(el: JQuery<HTMLElement>) {
    el[0].dispatchEvent(new Event("click"));
  }
}
