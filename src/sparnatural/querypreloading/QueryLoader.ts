import { SelectAllValue } from "../components/builder-section/groupwrapper/criteriagroup/edit-components/EditComponents";
import ObjectPropertyGroup from "../components/builder-section/groupwrapper/criteriagroup/objectpropertygroup/ObjectPropertyGroup";
import { OptionTypes } from "../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import ClassTypeId from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/ClassTypeId";
import EndClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/EndClassGroup";
import StartClassGroup from "../components/builder-section/groupwrapper/criteriagroup/startendclassgroup/StartClassGroup";
import GroupWrapper from "../components/builder-section/groupwrapper/GroupWrapper";
import NoOrderBtn from "../components/buttons/NoOrderBtn";
import { SelectedVal } from "../components/SelectedVal";
import SparnaturalComponent from "../components/SparnaturalComponent";
import { WidgetValue } from "../components/widgets/AbstractWidget";
import { Branch, ISparJson, Order, VariableTerm } from "../generators/ISparJson";


export default class QueryLoader{
    static sparnatural: SparnaturalComponent;
    static query: ISparJson
    
    static loadQuery(query:ISparJson){
        this.query = query
        // set Sparnatural quiet so it does not emit the update callbacks
        this.sparnatural.setQuiet(true);
        // first reset the current query
        this.sparnatural.BgWrapper.resetCallback();
        // build Sparnatural query
        // use a deep copy of the query to avoid modifying the original copy
        let clone = JSON.parse(JSON.stringify(query)) as ISparJson;
        let varMapping = this.#buildSparnatural(this.sparnatural, clone.branches);
        // set the correct variable names
        this.#updateNamingOfVariables(varMapping)
        // set the correct ordering of the draggables
        this.#updateOrderingOfVariables()
        // then reset the quiet flag
        this.sparnatural.setQuiet(false);
        // trigger query generation at then
        this.sparnatural.html[0].dispatchEvent(
          new CustomEvent("generateQuery")
        );
        this.sparnatural.html[0].dispatchEvent(
          new CustomEvent("redrawBackgroundAndLinks")
        );
    }
    
    static #buildSparnatural(sparnatural: SparnaturalComponent, branches: Array<Branch>):Map<string,string> {
        let varMapping = new Map<string,string>();
        if(branches?.length === 0) throw Error('No Branches on query detected')
        // first build the rootGroupWrapper
        let rootGrpWrapper =
        sparnatural.BgWrapper.componentsList.rootGroupWrapper;
        // build the root groupwrapper and remove from branches array
        let rootBranch = branches.shift();
        let localVarMapping = this.#buildCriteriaGroup(rootGrpWrapper, rootBranch);
        localVarMapping.forEach((value: string, key:string) => { varMapping.set(key, value); });
        
        // by default, the very first start class group will be selected
        // if the first variable is *not* selected, then unselect it
        const firstStartClassVal = { type: rootBranch.line.sType, variable: rootBranch.line.s };
        if(!QueryLoader.#hasSelectedVar(this.query.variables,firstStartClassVal.variable)) {
          // click on first eye btn to unselect it
          this.#clickOn((rootGrpWrapper.CriteriaGroup.StartClassGroup.inputSelector as ClassTypeId)?.selectViewVariableBtn?.widgetHtml)
        }

        let parent = rootGrpWrapper;
        branches.forEach((b) => {
          this.#clickOn(parent.CriteriaGroup.ActionsGroup.actions.ActionAnd.btn);
          let localVarMapping = this.#buildCriteriaGroup(parent.andSibling, b);
          localVarMapping.forEach((value: string, key:string) => { varMapping.set(key, value); });
          parent = parent.andSibling;
        });

        return varMapping;
    }
  
    static #buildCriteriaGroup(grpWarpper: GroupWrapper, branch: Branch):Map<string,string> {
      let varMapping = new Map<string,string>();
      // set StartClassVal only if there wasn't one set by the parent (e.g whereChild andSibling have it already set)
      const startClassVal = { type: branch.line.sType, variable: branch.line.s };
      if (!grpWarpper.CriteriaGroup.StartClassGroup.startClassVal.type) {
        //set StartClassGroup
        this.#setSelectedValue(
            grpWarpper.CriteriaGroup.StartClassGroup,
            branch.line.sType
        );
      }
      // also set the variable name
      // grpWarpper.CriteriaGroup.StartClassGroup.startClassVal = startClassVal;
      varMapping.set(grpWarpper.CriteriaGroup.StartClassGroup.startClassVal.variable, branch.line.s);
  
      // set EndClassGroup
      const endClassVal = { type: branch.line.oType, variable: branch.line.o };
      this.#setSelectedValue(grpWarpper.CriteriaGroup.EndClassGroup, branch.line.oType);
      // transparently set the variable name to the one in the query
      // before we click on the select button, so that the column is selected with the proper name
      // grpWarpper.CriteriaGroup.EndClassGroup.endClassVal = endClassVal;
      varMapping.set(grpWarpper.CriteriaGroup.EndClassGroup.endClassVal.variable, branch.line.o);

      //set ObjectPropertyGroup
      this.#setSelectedValue(
        grpWarpper.CriteriaGroup.ObjectPropertyGroup,
        branch.line.p
      );
    
      // set WidgetValues
      branch.line.values.forEach((v) => {
        const parsedVal: WidgetValue = grpWarpper.CriteriaGroup.EndClassGroup.editComponents.widgetWrapper.widgetComponent.parseInput(v)
        // if there are multiple values rendered, click first the 'plus' btn, to add more values
        if(grpWarpper.CriteriaGroup.endClassWidgetGroup.widgetValues.length > 0) this.#clickOn(grpWarpper.CriteriaGroup.endClassWidgetGroup.addWidgetValueBtn.html)
        grpWarpper.CriteriaGroup.EndClassGroup.editComponents.widgetWrapper.widgetComponent.renderWidgetVal(parsedVal)
      });

      // if there is no value, and no children, set an "Any" value
      if(branch.line.values.length == 0 && branch.children.length == 0) {
        grpWarpper.CriteriaGroup.EndClassGroup.editComponents.onSelectAll();
      }
    
      // trigger option state
      this.#triggerOptions(grpWarpper, branch);
    
      if (branch.children.length > 0) {
        this.#clickOn(
          grpWarpper.CriteriaGroup.EndClassGroup.editComponents.actionWhere.btn
        );
        this.#buildCriteriaGroup(grpWarpper.whereChild, branch.children.shift());
        // the rest of the children are AND connected
        let parent = grpWarpper.whereChild;
        branch.children.forEach((c) => {
          this.#clickOn(parent.CriteriaGroup.ActionsGroup.actions.ActionAnd.btn);
          let localVarMapping = this.#buildCriteriaGroup(parent.andSibling, c);
          localVarMapping.forEach((value:string,key: string) => varMapping.set(key, value));
          parent = parent.andSibling;
        });
      }
      
      // select if the var is viewed (eye btn)
      this.#setSelectViewVariableBtn(
        startClassVal,
        grpWarpper.CriteriaGroup.StartClassGroup,
        endClassVal,
        grpWarpper.CriteriaGroup.EndClassGroup
      )

      return varMapping;
  }
  
  static #triggerOptions(grpWrapper: GroupWrapper, branch: Branch) {
    if (branch.notExists && grpWrapper.optionState != OptionTypes.NOTEXISTS) {
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.widgetHtml);
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.NotExistsComponent.html);
    }
    if (branch.optional && grpWrapper.optionState != OptionTypes.OPTIONAL) {
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.optionalArrow.widgetHtml);
      this.#clickOn(grpWrapper.CriteriaGroup.OptionsGroup.OptionalComponent.html);
    }
  }
  
  // set the value for an inputTypeComponent and trigger the corresponding event
  static #setSelectedValue(
    component: StartClassGroup | EndClassGroup | ObjectPropertyGroup,
    value: string
  ) {
    // set the values to the ClassTypeId component
    component.inputSelector.oldWidget.val(value).niceSelect("update");
    let niceSelect = component.inputSelector.html[0].querySelectorAll('.nice-select')
    if (niceSelect.length > 1) console.warn('More than one nice-select found!')
    niceSelect[0].classList.add("disabled")
   
  }

  // this method checks if the eye btn was enabled in the loaded query
  static #setSelectViewVariableBtn(
    startClassVal:SelectedVal,
    startClassComponent:StartClassGroup,
    endClassVal:SelectedVal,
    endClassComponent:EndClassGroup
  ){
    if(QueryLoader.#hasSelectedVar(this.query.variables, endClassVal.variable)) {
      // click on eye btn
      this.#clickOn((endClassComponent.inputSelector as ClassTypeId)?.selectViewVariableBtn?.widgetHtml)
    }
  }

  static #updateOrderingOfVariables(){
    const varMenu =this.sparnatural.variableSection.variableOrderMenu
    this.query.variables.forEach(v=>{
      varMenu.draggables.forEach(d=>{
        let varName;
        if("expression" in v) {
          varName = v.expression.expression.value
        } else {
          varName = v.value;
        }

        if(d.state.selectedVariable.variable === varName){
          varMenu.removeDraggableByVarName(varName)
          varMenu.addDraggableComponent(d.state.selectedVariable)
        }       
      })
    })

    // once variables are sorted, synchronize with the actionstore
    // this.sparnatural.actionStore.variables = this.sparnatural.variableSection.listVariables();

    const variableSortOption =this.sparnatural.variableSection.variableSortOption;
    if(this.query.order == Order.ASC) {
      variableSortOption.changeSortOrderCallBack(Order.ASC);
    } else if(this.query.order == Order.DESC) {
      variableSortOption.changeSortOrderCallBack(Order.DESC);
    } else {
      variableSortOption.changeSortOrderCallBack(Order.NOORDER);
    }
  }

  // map of the names of variables in the current query to their target name
  static #updateNamingOfVariables(varNameMapping:Map<string,string>){
    const varMenu = this.sparnatural.variableSection.variableOrderMenu
    this.query.variables.forEach(v=>{
      varMenu.draggables.forEach(d=>{
        var varToConsider: VariableTerm;
        if("variable" in v) {
          // this is an aggregation
          varToConsider = v.variable;
        } else {
          // nominal case
          varToConsider = v;
        }

        if(varNameMapping.get(d.state.selectedVariable.variable) === varToConsider.value){
          d.setVarName(varToConsider.value);
        }
      })
    })
  }

  static #hasSelectedVar(vars:ISparJson["variables"], varName:string) {
    console.log("#hasSelectedVar : "+varName)

    var result:boolean = false;
    vars.forEach(v => {
      if("expression" in v) {
        // this is an aggregation
        // consider the variable *being aggregated*, not the result of the aggregation
        if(v.expression.expression.value == varName) result = true;
      }
      if("value" in v) {
        if(v.value == varName) result = true;
      }
    });
    return result;
  }
  
  static #clickOn(el: JQuery<HTMLElement>) {
    el[0].dispatchEvent(new Event("click"));
  }

  static setSparnatural(sparnatural:SparnaturalComponent){
    this.sparnatural = sparnatural
  }

}