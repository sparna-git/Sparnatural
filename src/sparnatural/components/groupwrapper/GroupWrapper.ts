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
class GroupWrapper extends HTMLComponent {
  whereChild: GroupWrapper = null;
  andSibling: GroupWrapper = null;
  linkAndBottom: LinkAndBottom; // connection line drawn from this CriteriaList with hasAnd CriteriaList
  linkWhereBottom: LinkWhereBottom;
  CriteriaGroup: CriteriaGroup;
  completed: boolean;
  hasAllCompleted: boolean;
  hasAnd: boolean;
  specProvider: ISpecProvider;
  // ParentComponent: ComponentsList | GroupWrapper
  constructor(ParentComponent: HTMLComponent, specProvider: ISpecProvider) {
    super("groupe", ParentComponent, null);
    this.specProvider = specProvider;
  }

  render(): this {
    super.render();
    // disable further links when max depth is reached
    if (!this.checkIfMaxDepthIsReached()) {
      this.html.addClass("addWereEnable");
    }
    this.#registerCriteriaEvents();
    this.CriteriaGroup = new CriteriaGroup(this, this.specProvider).render();
    return this;
  }

  #registerCriteriaEvents() {
    this.html[0].addEventListener("onRemoveEndClass", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#onRemoveEndClass();
    });
    this.html[0].addEventListener("onRemoveCriteria", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#onRemoveGrpWrapper();
    });

    this.html[0].addEventListener("addAndComponent", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#addAndComponent(e.detail);
    });

    this.html[0].addEventListener("addWhereComponent", (e: CustomEvent) => {
      e.stopImmediatePropagation();
      this.#addWhereComponent(e.detail);
    });
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
    let startVal = this.CriteriaGroup.StartClassGroup.startClassVal;
    this.CriteriaGroup.html.empty();
    this.CriteriaGroup.html.remove();
    this.CriteriaGroup = new CriteriaGroup(this, this.specProvider).render();
    this.CriteriaGroup.StartClassGroup.inputTypeComponent.oldWidget
      .val(startVal)
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
