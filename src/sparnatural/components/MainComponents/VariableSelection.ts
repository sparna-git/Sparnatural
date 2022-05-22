import Sortable from "sortablejs";
import { getSettings } from "../../../configs/client-configs/settings";
import HTMLComponent from "../../HtmlComponent";
import AscendBtn from "../buttons/AscendBtn";
import DescendBtn from "../buttons/DescendBtn";
import DisplayBtn from "../buttons/DisplayBtn";
import NoOrderBtn from "../buttons/NoOrderBtn";
import VariableOptionsSelectBtn from "../buttons/VariableOptionsSelectBtn";
//import VariableSelector from "./VariableSelector";

class VariableSection extends HTMLComponent {
  ascendBtn: AscendBtn;
  descendBtn: DescendBtn;
  noOrderBtn: NoOrderBtn;
  displayBtn: DisplayBtn
  variableOptionSelectBtn: VariableOptionsSelectBtn;
  linesWrapper: JQuery<HTMLElement>;
  otherSelectHtml: JQuery<HTMLElement>;
  displayVariableList: Array<string>;
  //variableSelector:VariableSelector

  constructor(ParentComponent: HTMLComponent) {
    super("variablesSelection", ParentComponent, null);
  }

  render(): this {
    super.render();
    this.ascendBtn = new AscendBtn(this, this.ascendCallBack);
    this.descendBtn = new DescendBtn(this, this.descendCallBack);
    this.noOrderBtn = new NoOrderBtn(this, this.noOrderCallback);
    this.variableOptionSelectBtn = new VariableOptionsSelectBtn(
      this,
      this.toggleVarNames
    );

    this.linesWrapper = $('<div class="linesWrapper"></div>');
    this.otherSelectHtml = $('<div class="variablesOtherSelect"></div>');

    this.linesWrapper.append(
      $('<div class="line1"></div>')
        .append($('<div class="variablesFirstSelect"></div>'))
        .append(this.otherSelectHtml)
    );
    let variablesOptionsSelect = $(
      `<div class="variablesOptionsSelect">
                ${getSettings().langSearch.SwitchVariablesNames}
                ${this.variableOptionSelectBtn.html}
            </div>`
    );

    let ordersSelectHtml = $(
      `<div class="variablesOrdersSelect">
                <strong>
                    ${getSettings().langSearch.labelOrderSort}
                </strong>
                ${this.ascendBtn.html}
                ${this.descendBtn.html}
                ${this.noOrderBtn}
            </div>`
    );

    this.linesWrapper.append(
      $('<div class="line2"></div>').append(
        $(ordersSelectHtml).append(variablesOptionsSelect)
      )
    );

    this.html.append(
      $(`<div class="variablesOrdersSelect"><strong>
        ${getSettings().langSearch.labelOrderSort}
        </strong>`)
    );
    this.#renderShowHideBtn();
    this.#addSortable();
    return this;
  }
  ascendCallBack = () => {
    this.html[0].dispatchEvent(
      new CustomEvent("changeOrderSort", { bubbles: true, detail: "asc" })
    );
  };
  descendCallBack = () => {
    this.html[0].dispatchEvent(
      new CustomEvent("changeOrderSort", { bubbles: true, detail: "desc" })
    );
  };
  noOrderCallback = () => {
    this.html[0].dispatchEvent(
      new CustomEvent("changeOrderSort", { bubbles: true, detail: "nosort" })
    );
  };

  toggleVarNames = (selected: boolean) => {
    this.html[0].dispatchEvent(
      new CustomEvent("toggleVarName", { bubbles: true, detail: selected })
    );
  };

  #renderShowHideBtn() {
    let displayaction = (displayed: boolean) => {
      if (displayed) {
        $(this.linesWrapper).animate(
          {
            height: 0,
          },
          500
        );
      } else {
        $(this.linesWrapper).animate(
          {
            height: $(this.linesWrapper).get(0).scrollHeight,
          },
          500,
          () => {
            $(this.linesWrapper).height("auto");
          }
        );
      }
    };

    this.displayBtn = new DisplayBtn(this, displayaction).render();
  }

  #addSortable() {
    let that = this;
    let sortable = new Sortable(this.otherSelectHtml[0], {
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
        that.#updateVariableList();
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

  #updateVariableList() {
    //refactor move away from jquery find
    var listedItems = $(this.otherSelectHtml).find(".sortableItem>div");
    this.displayVariableList = [];
    for (var i = 0; i < listedItems.length; i++) {
      var variableName = $(listedItems[i]).attr("data-variablename");
      this.displayVariableList.push(variableName);
    }
    this.html[0].dispatchEvent(new CustomEvent("submit", { bubbles: true }));
  }
}
export default VariableSection;
