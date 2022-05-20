import { getSettings } from "../../../../configs/client-configs/settings";
import GroupWrapper from "../../criterialist/GroupWrapper";
import ActionStore from "../ActionStore";

export default function initGeneralevent(actionStore: ActionStore) {
  let cssdef = "";
  //index used in callback
  let index = 0;
  let currentHeight = 0;
  let previousHeight = 0;
  // traverse through components and calculate background / linkAndBottoms /  for them
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse(
    (grpWrapper: GroupWrapper) => {
      previousHeight = currentHeight;
      currentHeight = grpWrapper.html.outerHeight(true) + 1;
      cssdef += drawBackgroungOfGroupWrapper(
        index,
        previousHeight,
        currentHeight
      );
      index++;
      if (grpWrapper.andSibling)
        drawLinkAndBottom(grpWrapper, previousHeight, currentHeight);
    }
  );
  actionStore.sparnatural.BgWrapper.html.css("background", cssdef);
}
// https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect/element-box-diagram.png
function drawLinkAndBottom(
  grpWarpper: GroupWrapper,
  prevHeight: number,
  currHeight: number
) {
  let posUpperStart =
    grpWarpper.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();
  let posLowerStart =
    grpWarpper.andSibling.CriteriaGroup.StartClassGroup.html[0].getBoundingClientRect();

  let line = {
    // line is located in the first quarter of StartClassGroup
    xStart: posUpperStart.left + (posUpperStart.right - posUpperStart.left) / 4,
    xEnd: posLowerStart.left + (posLowerStart.right - posLowerStart.left) / 4,
    yStart: posUpperStart.bottom,
    yEnd: posLowerStart.top,
    length: currHeight + prevHeight,
  };

  grpWarpper.linkAndBottom.setLineObj(line);
}

function drawBackgroungOfGroupWrapper(
  index: number,
  prev: number,
  currHeight: number
) {
  var ratio = 100 / 10 / 100;
  let a = (index + 1) * ratio;
  let rgba = `rgba(${getSettings().backgroundBaseColor},${a})`;
  return `linear-gradient(180deg,${rgba} ${prev}px, ${rgba} ${currHeight}px)`;
}
