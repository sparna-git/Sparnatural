import { SelectedVal } from "../../../../SelectedVal";
import GroupWrapper from "../../GroupWrapper";
import LinkWhereBottom from "../../LinkWhereBottom";
import { HTMLComponent } from "../../../../HtmlComponent";
import { I18n } from "../../../../../settings/I18n";

let removeEditComponents = (grpWrapper: GroupWrapper) => {
  grpWrapper.criteriaGroup.endClassGroup.html[0].dispatchEvent(
    new CustomEvent("removeEditComponents", {bubbles:true})
  );
  grpWrapper.criteriaGroup.endClassGroup.editComponents = null;
};

//give it additional class childsList
export function addWhereComponent(
  grpWrapper: GroupWrapper,
  endClassVal: SelectedVal
) {
  removeEditComponents(grpWrapper);
  //provide endclassval as startvalue for the new group
  grpWrapper.whereChild = new GroupWrapper(
    grpWrapper,
    grpWrapper,
    grpWrapper.specProvider,
    // depth = parent depth + 1
    grpWrapper.depth + 1,
    // order = 1, it will be the first sibling
    0,
    endClassVal
  ).render();

  // inherits the option state on where children
  // grpWrapper.whereChild.currentOptionState = grpWrapper.currentOptionState;
  grpWrapper.whereChild.setCurrentOptionState(grpWrapper.currentOptionState);

  //endClassVal is new startClassVal and trigger 'change' event on ClassTypeId
  let inputSelector =
    grpWrapper.whereChild.criteriaGroup.startClassGroup.inputSelector;
  
    inputSelector.submitSelected() ;
  // nice-select is 2nd place in childrenslist. move away from nice-select...
  //inputSelector.html[0].children[1].classList.add("disabled");
  // render the link where
  grpWrapper.linkWhereBottom = new LinkWhereBottom(grpWrapper).render();
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks", { bubbles: true })
  );
  // the line number is known once redrawn
  HTMLComponent.announce(
    grpWrapper.html[0],
    I18n.format("Announce.lineAdded", { n: grpWrapper.whereChild.lineNumber }),
    // true : with the keyboard, the focus goes to the list of the new line
    true
  );
}
