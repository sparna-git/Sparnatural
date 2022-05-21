import GroupWrapper from "../../components/groupwrapper/GroupWrapper";
import ActionStore from "../ActionStore";

export default function toggleVarNames(actionsStore: ActionStore) {
  actionsStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traverse(
    (grp:GroupWrapper) => {
      //TODO: add logic to display the varnames as labels
      //redrawBottomLink(grp.html); //TODO add logic to redraw the connecting lines in case they don't fit anymore
    }
  );
}
