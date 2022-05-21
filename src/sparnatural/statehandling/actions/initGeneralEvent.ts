import { getSettings } from "../../../configs/client-configs/settings";
import GroupWrapper from "../../components/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";
/*
  A general Event is either an addSiblingComponen/addWhereChild OR a onRemoveGrpWrapper
*/
export default function initGeneralevent(actionStore: ActionStore) {
  let cssdef = ``;
  //index used in callback
  let index = 0;
  let currentHeight = 0;
  let previousHeight = 0;
  // traverse through components and calculate background / linkAndBottoms /  for them
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse(
    (grpWrapper: GroupWrapper) => {
      renderLinks(grpWrapper);
      //render background
      previousHeight = currentHeight;
      currentHeight = grpWrapper.html.outerHeight(true) + 1;
      cssdef += drawBackgroungOfGroupWrapper(
        index,
        previousHeight,
        currentHeight
      );
      index++;
    }
  );
  let linGradCss = `linear-gradient(${cssdef})`;
  actionStore.sparnatural.BgWrapper.html.css({ background: linGradCss });
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

function drawBackgroungOfGroupWrapper(
  index: number,
  prev: number,
  currHeight: number
) {
  var ratio = 100 / 10 / 100;
  let a = (index + 1) * ratio;
  let rgba = `rgba(${getSettings().backgroundBaseColor},${a})`;
  if (index !== 0) {
    // comma in the string beginning
    return ` ,${rgba} ${prev}px, ${rgba} ${currHeight}px`;
  }
  return `${rgba} ${prev}px, ${rgba} ${currHeight}px`;
}
