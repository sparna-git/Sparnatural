import { getSettings } from "../../settings/defaultSettings";
import { OptionTypes } from "../../components/builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import SparnaturalComponent from "../../components/SparnaturalComponent";
/*
  Triggered either on an addSiblingComponen/addWhereChild OR a onRemoveGrpWrapper
*/
export default function redrawBackgroundAndLinks(sparnatural: SparnaturalComponent) {
  let cssdef = ``;
  //index used in callback
  let index = 0;
  let currentHeight = 0;
  let previousHeight = 0;
  // traversePreOrder through components and calculate background / linkAndBottoms /  for them
  sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      renderLinks(grpWrapper);
      rerenderOptionState(grpWrapper);
      //render background
      currentHeight = grpWrapper.CriteriaGroup.html.outerHeight(true) + 1;
      cssdef += drawBackgroundOfGroupWrapper(
        index,
        previousHeight,
        currentHeight
      );
      //Calculate start distance for next line.
      previousHeight = previousHeight + currentHeight + 1;
      index++;

      if(grpWrapper.whereChild != null) {
        // compute total height of children
        let childrenHeight = 0;
        grpWrapper.whereChild.traversePreOrder(
          (g: GroupWrapper) => {
            childrenHeight = g.CriteriaGroup.html.outerHeight(true)

            cssdef += drawBackgroundOfGroupWrapper(
              index,
              previousHeight,
              childrenHeight
            );
            //Calculate start distance for next line.
            previousHeight = previousHeight + childrenHeight + 1;
            index++;
          }
        );
      }
    }
  );
  let linGradCss = `linear-gradient(${cssdef})`;
  sparnatural.BgWrapper.html.css({ background: linGradCss });
}

// if the grpWrapper doesn't have prop .html, then it got deleted and the links don't need to be rerendered
function renderLinks(grpWrapper: GroupWrapper) {
  if (grpWrapper.whereChild) {
    grpWrapper.linkWhereBottom.html.empty();
    grpWrapper.linkWhereBottom.html.remove();
    if (grpWrapper.html) grpWrapper.linkWhereBottom.render();
  }
  if (grpWrapper.andSibling) {
    grpWrapper.linkAndBottom.html.empty();
    grpWrapper.linkAndBottom.html.remove();
    if (grpWrapper.html) grpWrapper.linkAndBottom.render();
  }
}

//sets the correct OptionState on newly added group wrappers
function rerenderOptionState(grpWrapper: GroupWrapper) {
  if (grpWrapper.optionState != OptionTypes.NONE) {
    let tmpOptionState = grpWrapper.optionState;
    grpWrapper.optionState = OptionTypes.NONE;
    grpWrapper.html[0].dispatchEvent(
      new CustomEvent("optionTriggered", { detail: tmpOptionState })
    );
  }
}

function drawBackgroundOfGroupWrapper(
  index: number,
  prevHeight: number,
  currHeight: number
) {
  var ratio = 100 / 10 / 100;
  let a = (index + 1) * ratio;
  // build the gradient using the RGB variables from the theme, plus the computed alpha value
  let rgba = `rgba(var(--bg-red),var(--bg-green),var(--bg-blue),${a})`;
  if (index !== 0) {
    // comma in the string beginning
    return ` ,${rgba} ${prevHeight}px, ${rgba} ${prevHeight+currHeight}px`;
  }
  return `${rgba} ${prevHeight}px, ${rgba} ${currHeight}px`;
}
