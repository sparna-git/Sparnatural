import SparnaturalComponent from "../components/SparnaturalComponent";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { Branch, ISparJson, Order } from "./ISparJson";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import { SelectAllValue } from "../components/builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import { DraggableComponentState } from "../components/variables-section/variableorder/DraggableComponent";

/*
  Reads out the UI and creates the internal JSON structure described here:
  https://docs.sparnatural.eu/Query-JSON-format
*/
class SparnaturalJsonGenerator {
  sparnatural: SparnaturalComponent;
  json: ISparJson = {
    distinct: null,
    variables: null,
    order: null,
    branches: null,
  };
  constructor(sparnatural: SparnaturalComponent) {
    this.sparnatural = sparnatural;
  }

  generateQuery(
    variables: Array<DraggableComponentState>,
    order: Order,
    distinct: boolean,
  ) {
    this.json.distinct = distinct;
    this.json.variables = variables.map(state => state.selectedVariable.variable);
    // don't output "noord", just set it to null
    if(order != Order.NOORDER) {
      this.json.order = order;
    } else {
      this.json.order = null;
    }
    
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
        p: CrtGrp.ObjectPropertyGroup.getTypeSelected(),
        o: CrtGrp.EndClassGroup.getVarName(),
        sType: CrtGrp.StartClassGroup.getTypeSelected(),
        oType: CrtGrp.EndClassGroup.getTypeSelected(),
        // extract only the value part, not the key
        values: CrtGrp.endClassWidgetGroup.getWidgetValues().filter(v => !(v instanceof SelectAllValue)).map(v => {return v.value;}),
      },
      children: grpWrapper.whereChild
        ? this.#getBranch(grpWrapper.whereChild)
        : []
    };

    // don't set the flags if they are not true
    if(grpWrapper.optionState == OptionTypes.OPTIONAL) {
      branch.optional = true;
    }
    if(grpWrapper.optionState == OptionTypes.NOTEXISTS) {
      branch.notExists = true;
    }

    branches.push(branch);
    if (grpWrapper.andSibling)
      branches.push(...this.#getBranch(grpWrapper.andSibling)); // spread operatore since getBranch() returns an array
    return branches;
  }
}

export default SparnaturalJsonGenerator;
