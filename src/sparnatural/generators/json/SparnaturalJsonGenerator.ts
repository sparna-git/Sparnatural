import SparnaturalComponent from "../../components/SparnaturalComponent";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import {
  Branch,
  ISparJson,
  Order,
  VariableExpression,
  VariableTerm,
} from "./ISparJson";
import { OptionTypes } from "../../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import { SelectAllValue } from "../../components/builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import { DraggableComponentState } from "../../components/variables-section/variableorder/DraggableComponent";
import { DataFactory } from "rdf-data-factory";
import SparnaturalFormComponent from "../../../sparnatural-form/components/SparnaturalFormComponent";

const factory = new DataFactory();

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
    variables: Array<DraggableComponentState> | string[],
    order: Order,
    distinct: boolean,
    limit:number
  ) {
    this.json.distinct = distinct;
    this.json.variables = this.#toVariables(
      variables as Array<DraggableComponentState>
    );
    // don't output "noord", just set it to null
    if (order != Order.NOORDER) {
      this.json.order = order;
    } else {
      this.json.order = null;
    }
    
    this.json.branches = this.#getBranch(
      this.sparnatural.BgWrapper.componentsList.rootGroupWrapper,
      false
    );

    this.json.limit = limit;
    
    return this.json;
  }

  #toVariables(
    variables: Array<DraggableComponentState>
  ): Array<VariableTerm | VariableExpression> {
    return variables.map((v) => {
      if (v.aggregateFunction) {
        return {
          expression: {
            type: "aggregate",
            aggregation: v.aggregateFunction,
            distinct: false,
            expression: {
              termType: "Variable",
              value: v.originalVariable.variable,
            },
          },
          variable: {
            termType: "Variable",
            value: v.selectedVariable.variable,
          },
        };
      } else {
        return {
          termType: "Variable",
          value: v.selectedVariable.variable,
        };
      }
    });
  }

  // goes recursivly through the grpWrappers and collects all the data
  #getBranch(grpWrapper: GroupWrapper, isInOption:boolean): Array<any> {
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
        values: CrtGrp.endClassWidgetGroup
          .getWidgetValues()
          .filter((v) => !(v instanceof SelectAllValue))
          .map((v) => {
            return v.value;
          }),
      },
      children: grpWrapper.whereChild
        // either we are already in an option, or one was set at this level
        ? this.#getBranch(grpWrapper.whereChild, isInOption || (grpWrapper.optionState != OptionTypes.NONE))
        : []
    };

    // don't set the flags if they are not true
    if(!isInOption && (grpWrapper.optionState == OptionTypes.OPTIONAL)) {
      branch.optional = true;
    }
    if(!isInOption && (grpWrapper.optionState == OptionTypes.NOTEXISTS)) {
      branch.notExists = true;
    }

    branches.push(branch);
    if (grpWrapper.andSibling)
      // pass the "isInOption" flag down
      branches.push(...this.#getBranch(grpWrapper.andSibling, isInOption)); // spread operatore since getBranch() returns an array
    return branches;
  }
}

export default SparnaturalJsonGenerator;
