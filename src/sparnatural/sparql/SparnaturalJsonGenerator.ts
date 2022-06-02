import Sparnatural from "../components/Sparnatural";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import { Branch, ISparJson, Language, Order,SelectedVal } from "./ISparJson";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
  
/*
  Reads out the UI and creates the internal JSON structure described here:
  https://docs.sparnatural.eu/Query-JSON-format
*/
  class SparnaturalJsonGenerator {
    sparnatural: Sparnatural;
    json: ISparJson = {
      distinct: null,
      variables: null,
      lang: null,
      order: null,
      branches: null
    }
    constructor(sparnatural:Sparnatural) {
        this.sparnatural = sparnatural
    }

    generateQuery(variables:Array<string>,distinct:boolean,order:Order,lang:Language){
        this.json.distinct = distinct
        this.json.variables = variables
        this.json.order = order
        this.json.lang = lang
        this.json.branches = this.#getBranch(this.sparnatural.BgWrapper.componentsList.rootGroupWrapper)
        return this.json
    }
    // goes recursivly through the grpWrappers and collects all the data
    #getBranch(grpWrapper: GroupWrapper):Array<any>{
      let branches = []
      let CrtGrp = grpWrapper.CriteriaGroup
      let branch:Branch = {
          line: {
             s:CrtGrp.StartClassGroup.getVarName(),
             p:CrtGrp.ObjectPropertyGroup.getTypeSelected(),
             o:CrtGrp.EndClassGroup.getVarName(),
             sType:CrtGrp.StartClassGroup.getTypeSelected(),
             oType:CrtGrp.EndClassGroup.getTypeSelected(),
             values:CrtGrp.EndClassGroup.endClassWidgetGroup.getWidgetValue()
          },
          children: grpWrapper.whereChild ? this.#getBranch(grpWrapper.whereChild) : [],
          optional: grpWrapper.optionState == OptionTypes.OPTIONAL,
          notExists: grpWrapper.optionState == OptionTypes.NOTEXISTS
      }
      branches.push(branch)
      if(grpWrapper.andSibling) branches.push(...this.#getBranch(grpWrapper.andSibling))
      return branches
    }
  }
  
  export default SparnaturalJsonGenerator;
  