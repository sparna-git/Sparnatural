import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import DraggableComponent from "../../components/variables-section/variableorder/DraggableComponent";
import ActionStore from "../ActionStore";

/*
    Fired when a variable name got changed in the DraggableComponent
    traverse through Sparnatural and change the var names in the SubjectSlct and ObjectSlct
*/
export default function updateVarName(
  actionStore: ActionStore,
  oldName: string,
  newName: string
) {
  // traversePreOrder through components and calculate background / linkAndBottoms /  for them
  actionStore.sparnatural.BgWrapper.componentsList.rootGroupWrapper.traversePreOrder(
    (grpWrapper: GroupWrapper) => {
      let sparqlVar = `?${oldName}`;
      let newSparqlVar = `?${newName}`;
      let SubjectSlct = grpWrapper.CriteriaGroup.SubjectSelector;
      let objectSlct = grpWrapper.CriteriaGroup.ObjectSelector;
      if (SubjectSlct.getVarName() === sparqlVar) SubjectSlct.setVarName(newSparqlVar);
      if (objectSlct.getVarName() === sparqlVar) objectSlct.setVarName(newSparqlVar);
    }
  );
  //add variables list in actionstore
  actionStore.variables =
    actionStore.sparnatural.variableSection.variableOrderMenu.draggables.map(
      (d: DraggableComponent) => {
        return d.varName;
      }
    );
  actionStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks")
  );
}
