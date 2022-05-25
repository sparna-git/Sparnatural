import { getSettings } from "../../../../configs/client-configs/settings";
import ISpecProvider from "../../../spec-providers/ISpecProviders";

import LinkAndBottom from "./LinkAndBottom";
import LinkWhereBottom from "./LinkWhereBottom";
import CriteriaGroup from "./criteriagroup/CriteriaGroup";
import HTMLComponent from "../../HtmlComponent";
/*
  GroupWrapper class represents a row in Sparnatural. It is the WrapperClass for the CriteriaGroup
*/
class GroupWrapper extends HTMLComponent {
  whereChild: GroupWrapper = null;
  andSibling: GroupWrapper = null;
  optional = false
  notexists = false
  linkAndBottom: LinkAndBottom; // connection line drawn from this CriteriaList with hasAnd CriteriaList
  linkWhereBottom: LinkWhereBottom;
  CriteriaGroup: CriteriaGroup;
  specProvider: ISpecProvider;
  // ParentComponent: ComponentsList | GroupWrapper
  constructor(ParentComponent: HTMLComponent, specProvider: ISpecProvider) {
    super("groupe", ParentComponent, null);
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();
    // disable further links when max depth is reached
    //TODO: does this still work????
    if (!this.checkIfMaxDepthIsReached()) {
      this.html.addClass("addWereEnable");
    }
    this.#registerGrpWrapperEvents();
    this.CriteriaGroup = new CriteriaGroup(this, this.specProvider).render();
    return this;
  }

  #registerGrpWrapperEvents() {
    this.html[0].addEventListener("onGrpInputCompleted", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#onGrpInputCompleted();
    });
    this.html[0].addEventListener("onRemoveEndClass", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#onRemoveEndClass();
    });
    this.html[0].addEventListener("onRemoveGrp", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#onRemoveGrpWrapper();
    });

    this.html[0].addEventListener("addAndComponent", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#addAndComponent(e.detail.type);
    });

    this.html[0].addEventListener("addWhereComponent", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#onGrpInputCompleted()
      this.#addWhereComponent(e.detail.type);
    });
  }

  //Input is completed by either choosing widgetvalue or adding a whereChild
  #onGrpInputCompleted(){
    this.CriteriaGroup.EndClassGroup.renderSelectViewVar()
    this.CriteriaGroup.StartClassGroup.inputTypeComponent.html[0].classList.add("Highlited")
    this.CriteriaGroup.EndClassGroup.inputTypeComponent.html[0].classList.add('Highlited')
  }

  //add GroupWrapper as a Sibling
  #addAndComponent(startClassVal: string) {
    this.andSibling = new GroupWrapper(
      this.ParentComponent,
      this.specProvider
    ).render();
    //set state to startClassValSelected and trigger change
    this.andSibling.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
      .val(startClassVal)
      .niceSelect("update");
    this.linkAndBottom = new LinkAndBottom(this).render();
    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );
  }

  // Create a SubComponentsList and add the GroupWrapper there
  // activate lien top
  //give it additional class childsList
  #addWhereComponent(endClassVal: string) {
    this.#removeEditComponents();
    this.whereChild = new GroupWrapper(this, this.specProvider).render();

    //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
    this.whereChild.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
      .val(endClassVal)
      .niceSelect("update");
    this.linkWhereBottom = new LinkWhereBottom(this).render();
    this.html[0].dispatchEvent(
      new CustomEvent("initGeneralEvent", { bubbles: true })
    );
  }

  #removeEditComponents() {
    this.CriteriaGroup.EndClassGroup.actionWhere.html.remove();
    this.CriteriaGroup.EndClassGroup.actionWhere = null;
    this.CriteriaGroup.EndClassGroup.endClassWidgetGroup.inputTypeComponent.html.remove();
    this.CriteriaGroup.EndClassGroup.endClassWidgetGroup.inputTypeComponent =
      null;
  }
  checkIfMaxDepthIsReached() {
    let maxreached = false;
    this.html[0].dispatchEvent(
      new CustomEvent("getMaxVarIndex", {
        bubbles: true,
        detail: (index: number) => {
          //getting the value Sparnatural
          if (index >= getSettings().maxDepth) maxreached = true;
        },
      })
    );
    return maxreached;
  }

  //If the CriteriaGroup should be deleted
  #onRemoveGrpWrapper() {
    this.html[0].dispatchEvent(
      new CustomEvent("deleteGrpWrapper", { bubbles: true, detail: this })
    );
    this.html[0].dispatchEvent(new CustomEvent("generateQuery", { bubbles: true }));
  }

  // Remove the EndClass and rerender from the point where the startClassVal got selected
  #onRemoveEndClass() {
    // first delete the whereChild classes
    if(this.whereChild) this.whereChild.html[0].dispatchEvent(new CustomEvent('onRemoveGrp'))

    let startVal = this.CriteriaGroup.StartClassGroup.startClassVal;
    this.CriteriaGroup.html.empty();
    this.CriteriaGroup.html.remove();
    this.CriteriaGroup = new CriteriaGroup(this, this.specProvider).render();
    this.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
      .val(startVal.type)
      .niceSelect("update");
  }

  // set back state
  setObjectPropertySelectedState() {
    let opVal = this.CriteriaGroup.ObjectPropertyGroup.objectPropVal;
    this.CriteriaGroup.html[0].dispatchEvent(
      new CustomEvent("onObjectPropertyGroupSelected", { detail: opVal })
    );
  }

  // this method traverses recurively through all the GroupWrappers and calls the callback
  traverse(callBack: (grpWarpper: GroupWrapper) => void) {
    callBack(this);
    if (this.whereChild) this.whereChild.traverse(callBack);
    if (this.andSibling) this.andSibling.traverse(callBack);
    return;
  }
}
export default GroupWrapper;
