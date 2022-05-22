import Sortable from "sortablejs";
import HTMLComponent from "../../../HtmlComponent";
import VariableSelection from "../VariableSelection";

class VariableOrderMenu extends HTMLComponent {
    displayVariableList: Array<string>;
    constructor(parentComponent: VariableSelection){
        super('VariableOrderMenu',parentComponent,null)
    }

    render(): this {
        this.htmlParent = $(this.ParentComponent.html).find(".line1");
        super.render()
        let otherSelectHtml = $('<div class="variablesOtherSelect"></div>');
        this.html.append($('<div class="variablesFirstSelect"></div>'))
        .append(otherSelectHtml)
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
          onAdd: function (/**Event*/ evt: any) {
            // same properties as onEnd
          },
    
          // Changed sorting within list
          onUpdate: function (/**Event*/ evt: any) {
            // same properties as onEnd
            that.#updateVariableList(htmlParent);
          },
    
          // Called by any change to the list (add / update / remove)
          onSort: function (/**Event*/ evt: any) {
            // same properties as onEnd
          },
    
          // Called when dragging element changes position
          onEnd: function (/**Event*/ evt: any) {
            evt.newIndex; // most likely why this event is used is to get the dragging element's current index
            // same properties as onEnd
            var width = $(".sortableItem").first().width();
            $(".variablesOrdersSelect").width(width);
          },
        });
      }

      

  #updateVariableList(htmlParent:JQuery<HTMLElement>) {
    //refactor move away from jquery find
    var listedItems = $(htmlParent).find(".sortableItem>div");
    this.displayVariableList = [];
    for (var i = 0; i < listedItems.length; i++) {
      var variableName = $(listedItems[i]).attr("data-variablename");
      this.displayVariableList.push(variableName);
    }
    this.html[0].dispatchEvent(new CustomEvent("submit", { bubbles: true }));
  }
}

export default VariableOrderMenu