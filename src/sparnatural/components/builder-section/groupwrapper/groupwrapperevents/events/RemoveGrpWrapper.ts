import GroupWrapper from "../../GroupWrapper";

//If the GroupWrapper should be deleted
export function removeGrpWrapper(grpWrapper: GroupWrapper) {
  grpWrapper.html[0].dispatchEvent(
    new CustomEvent("deleteGrpWrapper", { bubbles: true, detail: grpWrapper })
  );
}
