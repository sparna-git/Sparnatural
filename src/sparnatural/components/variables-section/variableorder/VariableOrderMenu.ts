import Sortable, { SortableEvent } from "sortablejs";

import ISpecProvider from "../../../spec-providers/ISpecProviders";
import HTMLComponent from "../../HtmlComponent";
import VariableSelection from "../VariableSelection";
import DraggableComponent from "./DraggableComponent";

class VariableOrderMenu extends HTMLComponent {
    displayVariableList: Array<string> = [];
    draggables: Array<DraggableComponent> = [];
    specProvider: ISpecProvider;
    constructor(parentComponent: VariableSelection,specProvider:ISpecProvider){
        super('VariableOrderMenu',parentComponent,null)
        this.specProvider = specProvider
    }

    render(): this {
        this.htmlParent = $(this.ParentComponent.html).find(".line1");
        super.render()
        let otherSelectHtml = $('<div class="variablesOtherSelect"></div>');
        this.html.append(otherSelectHtml)
        this.addDraggableComponent('http://dbpedia.org/ontology/Museum','testvarname')
        this.#addSortable(otherSelectHtml);

        return this
    }

    #addSortable(htmlParent:JQuery<HTMLElement>) {
        let that = this;
        let sortable = new Sortable(htmlParent[0], {
          group: "name", // or { name: "...", pull: [true, false, 'clone', array], put: [true, false, array] }
          sort: true, // sorting inside list
          delay: 0, // time in milliseconds to define when the sorting should start
          delayOnTouchOnly: false, // only delay if user is using touch
          touchStartThreshold: 0, // px, how many pixels the point should move before cancelling a delayed drag event
          disabled: false, // Disables the sortable if set to true.
          store: null, // @see Store
          animation: 150, // ms, animation speed moving items when sorting, `0` — without animation
          easing: "cubic-bezier(1, 0, 0, 1)", // Easing for animation. Defaults to null. See https://easings.net/ for examples.
          handle: "div>.variable-handle", // Drag handle selector within list items
          filter: ".ignore-elements", // Selectors that do not lead to dragging (String or Function)
          preventOnFilter: true, // Call `event.preventDefault()` when triggered `filter`
          draggable: ".sortableItem", // Specifies which items inside the element should be draggable
    
          dataIdAttr: "data-variableName", // HTML attribute that is used by the `toArray()` method
    
          ghostClass: "sortable-ghost", // Class name for the drop placeholder
          chosenClass: "sortable-chosen", // Class name for the chosen item
          dragClass: "sortable-drag", // Class name for the dragging item
    
          // Element is dropped into the list from another list
          onAdd: function (/**Event*/ evt: SortableEvent) {
            // same properties as onEnd
          },
    
          // Changed sorting within list
          onUpdate: function (/**Event*/ evt: SortableEvent) {
            // same properties as onEnd

          },
    
          // Called by any change to the list (add / update / remove)
          onSort: function (/**Event*/ evt: SortableEvent) {
            // same properties as onEnd
          },
    
          // Called when dragging element changes position
          onEnd: function (/**Event*/ evt:SortableEvent) {
              this.displayVariableList = this.toArray()
            that.#updateVariableList();
            // same properties as onEnd
            var width = $(".sortableItem").first().width();
            $(".variablesOrdersSelect").width(width);
          },
        });
      }

      
      addDraggableComponent(selected_val:string,varName:string){
          let dragbl = new DraggableComponent(this,this.specProvider,selected_val,varName)
          dragbl.render()
          this.draggables.push(dragbl)
      }


  #updateVariableList() {
    this.html[0].dispatchEvent(new CustomEvent("generateQuery", { bubbles: true }));
  }
}

export default VariableOrderMenu