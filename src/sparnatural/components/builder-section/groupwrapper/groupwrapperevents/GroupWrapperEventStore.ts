import GroupWrapper from "../GroupWrapper";
import { addAndComponent } from "./events/AddAndComponent";
import { addWhereComponent } from "./events/AddWhereComponent";
import { completeGrpInput } from "./events/CompleteGrpInput";
import { inCompleteGrpInput } from "./events/InCompleteGrpInput";
import { removeEndClass } from "./events/RemoveEndClass";
import { removeGrpWrapper } from "./events/RemoveGrpWrapper";

export default class GroupWrapperEventStore {
  grpWrapper: GroupWrapper;
  constructor(grpWrapper: GroupWrapper) {
    this.grpWrapper = grpWrapper;
    this.#registerGrpWrapperEvents();
  }

  #registerGrpWrapperEvents() {
    this.grpWrapper.html[0].addEventListener(
      "onGrpInputCompleted",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        completeGrpInput(this.grpWrapper);
      }
    );
    this.grpWrapper.html[0].addEventListener(
      "onGrpInputNotCompleted",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        inCompleteGrpInput(this.grpWrapper);
      }
    );
    this.grpWrapper.html[0].addEventListener(
      "onRemoveEndClass",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        removeEndClass(this.grpWrapper);
      }
    );
    this.grpWrapper.html[0].addEventListener(
      "onRemoveGrp",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        removeGrpWrapper(this.grpWrapper);
      }
    );

    this.grpWrapper.html[0].addEventListener(
      "addAndComponent",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        addAndComponent(this.grpWrapper, e.detail);
      }
    );

    this.grpWrapper.html[0].addEventListener(
      "addWhereComponent",
      (e: CustomEvent) => {
        e.stopImmediatePropagation();
        completeGrpInput(this.grpWrapper);
        addWhereComponent(this.grpWrapper, e.detail);
      }
    );

    this.grpWrapper.html[0].addEventListener(
      "optionTriggered",
      (e: CustomEvent) => {
        if (!("detail" in e) || e.detail == "" || !e.detail)
          throw Error(
            "No OptionalType payload received! optionTriggered must send payload of type OptionTypes!"
          );
        e.stopImmediatePropagation();
        let newOptionState = e.detail;
        this.grpWrapper.triggerOption(newOptionState);
        this.grpWrapper.html[0].dispatchEvent(
          new CustomEvent("generateQuery", { bubbles: true })
        );
      }
    );
  }
}
