import Sparnatural from "../components/SparnaturalComponent";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { Branch, ISparJson, Order } from "./ISparJson";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import { SelectAllValue } from "../components/builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";

/*
  Reads out the UI and creates the internal JSON structure described here:
  https://docs.sparnatural.eu/Query-JSON-format
*/
class SparnaturalJsonGenerator {
  sparnatural: Sparnatural;
  json: ISparJson = {
    distinct: null,
    variables: null,
    order: null,
    branches: null,
  };
  constructor(sparnatural: Sparnatural) {
    this.sparnatural = sparnatural;
  }

  generateQuery(
    variables: Array<string>,
    distinct: boolean,
    order: Order
  ) {
    this.json.distinct = distinct;
    this.json.variables = variables;
    this.json.order = order;
    this.json.branches = this.#getBranch(
      this.sparnatural.BgWrapper.componentsList.rootGroupWrapper
    );
    return this.json;
  }
  // goes recursivly through the grpWrappers and collects all the data
  #getBranch(grpWrapper: GroupWrapper): Array<any> {
    let branches = [];
    let CrtGrp = grpWrapper.CriteriaGroup;
    let branch: Branch = {
      line: {
        s: CrtGrp.StartClassGroup.getVarName(),
        sType: CrtGrp.StartClassGroup.getTypeSelected(),
        p: CrtGrp.ObjectPropertyGroup.getVarName(),
        pType: CrtGrp.ObjectPropertyGroup.getTypeSelected(),
        o: CrtGrp.EndClassGroup.getVarName(),
        oType: CrtGrp.EndClassGroup.getTypeSelected(),
        // extract only the value part, not the key
        values: CrtGrp.endClassWidgetGroup.getWidgetValues().filter(v => !(v instanceof SelectAllValue)).map(v => {return v.value;}),
      },
      children: grpWrapper.whereChild
        ? this.#getBranch(grpWrapper.whereChild)
        : [],
      optional: grpWrapper.optionState == OptionTypes.OPTIONAL,
      notExists: grpWrapper.optionState == OptionTypes.NOTEXISTS,
    };
    branches.push(branch);
    if (grpWrapper.andSibling)
      branches.push(...this.#getBranch(grpWrapper.andSibling)); // spread operatore since getBranch() returns an array
    return branches;
  }
}

export default SparnaturalJsonGenerator;
