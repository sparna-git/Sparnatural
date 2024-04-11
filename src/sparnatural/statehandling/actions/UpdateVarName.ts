import GroupWrapper from "../../components/builder-section/groupwrapper/GroupWrapper";
import DraggableComponent from "../../components/variables-section/variableorder/DraggableComponent";
import ActionStore from "../ActionStore";

/*
    Fired when a variable name got changed in the DraggableComponent
    traverse through Sparnatural and change the var names in the StartGrp and EndGrp
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
      let startGrp = grpWrapper.CriteriaGroup.StartClassGroup;
      let endGrp = grpWrapper.CriteriaGroup.EndClassGroup;
      if (startGrp.getVarName() === sparqlVar) startGrp.setVarName(newSparqlVar);
      if (endGrp.getVarName() === sparqlVar) endGrp.setVarName(newSparqlVar);
    }
  );
  //add variables list in actionstore
  actionStore.variables = actionStore.sparnatural.variableSection.listVariables();

  actionStore.sparnatural.html[0].dispatchEvent(
    new CustomEvent("redrawBackgroundAndLinks")
  );
}
