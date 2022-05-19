import { getSettings } from "../../../configs/client-configs/settings";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import HTMLComponent from "../../HtmlComponent";
import CriteriaGroup from "./CriteriaGroup";
import LinkAndBottom from "./LinkAndBottom";
import LinkWhereBottom from "./LinkWhereBottom";
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
    CriteriaGroup:CriteriaGroup 
    completed:boolean 
    hasAllCompleted:boolean 
    hasAnd:boolean
    specProvider:ISpecProvider
    jsonQueryBranch:any = null
    // ParentComponent: ComponentsList | GroupWrapper
    constructor(ParentComponent:HTMLComponent,specProvider:ISpecProvider,jsonQueryBranch:any)
      {
        super('groupe',ParentComponent,null)
        this.specProvider = specProvider
        this.jsonQueryBranch = jsonQueryBranch
      }

    render(): this {
      super.render()
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
      this.html[0].addEventListener('onRemoveCriteria',(e:CustomEvent)=>{
        e.stopImmediatePropagation()
        this.onRemoveCriteriaGroup()
      })

      this.html[0].addEventListener('addAndComponent',(e:CustomEvent)=>{
        e.stopImmediatePropagation()
        this.#addAndComponent(e.detail)
      })

      this.html[0].addEventListener('addWhereComponent',(e:CustomEvent)=>{
        e.stopImmediatePropagation()
        this.#addWhereComponent(e.detail)
      })
    }

    //add GroupWrapper as a Sibling
    #addAndComponent(startClassVal:string){
      console.log('addAndComponent')
      this.andSibling = new GroupWrapper(this.ParentComponent,this.specProvider,this.jsonQueryBranch).render()
      //set state to startClassValSelected
      this.andSibling.CriteriaGroup.html[0].dispatchEvent(new CustomEvent('StartClassGroupSelected',{detail:startClassVal}))
      this.linkAndBottom.render()
      this.html[0].dispatchEvent(new CustomEvent('initGeneralEvent',{bubbles:true}))
    }

  
    // Create a SubComponentsList and add the GroupWrapper there
    // activate lien top
    //give it additional class childsList
    #addWhereComponent(endClassVal:string){
      this.#removeEditComponents()
      this.whereChild = new GroupWrapper(this,this.specProvider,this.jsonQueryBranch).render()

      //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
      this.whereChild.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget.val(endClassVal).niceSelect('update')
      this.linkWhereBottom.render()
    }
  
  #removeEditComponents(){
    this.CriteriaGroup.EndClassGroup.actionWhere.html.remove()
    this.CriteriaGroup.EndClassGroup.endClassWidgetGroup.inputTypeComponent.html.remove()
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