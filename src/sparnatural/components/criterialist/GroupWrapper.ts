import { getSettings } from "../../../configs/client-configs/settings";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import HTMLComponent from "../../HtmlComponent";
import CriteriaGroup from "./CriteriaGroup";
import LinkAndBottom from "./LinkAndBottom";
import LinkWhereBottom from "./LinkWhereBottom";
import LienTop from "./LienTop";
/*
    This Components represents the <li class="groupe"..> tag
    Possible states are:
    - addWhereEnable: it is possible to have a next WHERE relationship to a child CriteriaList
    - addWhereDisable: it is not(!) possible to have a next WHERE relationship to a child CriteriaList
    - haveWereChild: The CriteriaList has a WHERE connection to a sub CriteriaList
    - completed: The inputs for this CriteriaGroup are all selected
    - hasallCompleted: The inputs for this CriteriaGroup and(!) all subCriteriaLists are all selected
    - hasAnd: The CriteriaList has an ADD connection to a sibling CriteriaList
*/
class GroupWrapper extends HTMLComponent{
    whereChild:GroupWrapper = null
    andSibling:GroupWrapper = null
    linkAndBottom = new LinkAndBottom(this) // connection line drawn from this CriteriaList with hasAnd CriteriaList
    linkWhereBottom = new LinkWhereBottom(this)
    LienTop = new LienTop(this) // connection line drawn from this CriteriaList hasWhereChild CriteriaList
    CriteriaGroup:CriteriaGroup 
    completed:boolean 
    hasAllCompleted:boolean 
    hasAnd:boolean
    specProvider:ISpecProvider
    jsonQueryBranch:any = null
    startClassValue:any // if this is a sibling or child. It needs a startingValue for the StartClass
    // ParentComponent: ComponentsList | GroupWrapper
    constructor(ParentComponent:HTMLComponent,specProvider:ISpecProvider,jsonQueryBranch:any,startClassValue?:any)
      {
        super('groupe',ParentComponent,null)
        this.specProvider = specProvider
        this.jsonQueryBranch = jsonQueryBranch
        this.startClassValue = startClassValue
      }

    render(): this {
      super.render()
      //if the parent is a GroupWrapper then this Group Wrapper is a where child
      if(isGroupWrapper(this.ParentComponent)) this.LienTop.render()

       // disable further links when max depth is reached
      if(!this.checkIfMaxDepthIsReached()){
        //
        //
        this.html.addClass('addWereEnable')
      }
      this.#registerAddComponentHooks()
      this.CriteriaGroup = new CriteriaGroup(this,this.specProvider,this.jsonQueryBranch).render()
      return this
    }

    #registerAddComponentHooks(){
      this.html[0].addEventListener('onRemevoeCriteria',()=>{
        this.onRemoveCriteriaGroup()
      })

      this.html[0].addEventListener('addAndComponent',()=>{
        this.#addAndComponent()
      })

      this.html[0].addEventListener('addWhereComponent',()=>{
        this.#addWhereComponent()
      })
    }

    //add GroupWrapper as a Sibling
    #addAndComponent(){
      let startClassValue = this.CriteriaGroup.StartClassGroup.value_selected
      this.andSibling = new GroupWrapper(this.ParentComponent,this.specProvider,this.jsonQueryBranch,startClassValue)
      this.linkAndBottom.render()
      // trigger 2 clicks to select the same class as the current criteria (?)
      this.CriteriaGroup.StartClassGroup.html
      .find(".nice-select:not(.disabled)")
      .trigger("click");
      this.CriteriaGroup.StartClassGroup.html
      .find(".nice-select:not(.disabled)")
      .trigger("click");
      // set hasAnd Class. set relative position in css. necessary?
      this.html.addClass("hasAnd")
      this.html[0].dispatchEvent(new CustomEvent('initGeneralevent',{bubbles:true}))
    }

  
    // Create a SubComponentsList and add the GroupWrapper there
    // activate lien top
    //give it additional class childsList
    #addWhereComponent(){
      this.whereChild = new GroupWrapper(this,this.specProvider,this.jsonQueryBranch)
      this.linkWhereBottom.render()
      //add two clicks?
      this.CriteriaGroup.StartClassGroup.html
      .find(".nice-select:not(.disabled)")
      .trigger("click");
      this.CriteriaGroup.StartClassGroup.html
      .find(".nice-select:not(.disabled)")
      .trigger("click");
    }

  checkIfMaxDepthIsReached(){
    let maxreached = false
    this.html[0].dispatchEvent(new CustomEvent('getMaxVarIndex',{bubbles:true,detail:(index:number)=>{
      //getting the value Sparnatural
      if(index >= getSettings().maxDepth) maxreached=true
    }}))
    return maxreached
  }

//If the CriteriaGroup should be deleted
onRemoveCriteriaGroup(){
  //delete everything under it
  this.html.empty()

  //rerender the criteria group
  this.CriteriaGroup = new CriteriaGroup(this,this.specProvider,this.jsonQueryBranch)
  // revaluate the which criteria groups got deleted. Maybe run through Componentslist and see which CriteriaGroups are now null??

  // TODO check if any variables are highlighted in variable selection. then delete them
  // TODO reavulate the query branches to create new query

    // re-submit form after deletion
    this.html[0].dispatchEvent(new CustomEvent('initGeneralEvent',{bubbles:true}))
    this.html[0].dispatchEvent(new CustomEvent('submit',{bubbles:true}))
}

// this method traverses recurively through all the GroupWrappers and calls the callback
traverse(callBack:(grpWarpper:GroupWrapper)=>void){
  callBack(this)
  if(this.whereChild) this.whereChild.traverse(callBack)
  if(this.andSibling) this.andSibling.traverse(callBack)
  return
}

}
export default GroupWrapper

function isGroupWrapper(
  ParentComponent: HTMLComponent
): ParentComponent is GroupWrapper {
  return (
    (ParentComponent as GroupWrapper).baseCssClass ===
    "groupe"
  );
} // https://www.typescriptlang.org/docs/handbook/advanced-types.html#user-defined-type-guards