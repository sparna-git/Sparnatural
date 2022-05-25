import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";

export default function toggleVarNames(actionsStore: ActionStore) {
  actionsStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grp:GroupWrapper) => {
      //TODO: add logic to display the varnames as labels
      //redrawBottomLink(grp.html); //TODO add logic to redraw the connecting lines in case they don't fit anymore
    }
  );
}
