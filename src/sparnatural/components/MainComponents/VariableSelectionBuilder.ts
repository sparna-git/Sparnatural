

import Sortable from "sortablejs"; // has to add allowSyntheticDefaultImports in tsconfig cause of this import
import { getSettings } from "../../../configs/client-configs/settings";
import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import HTMLComponent from "../../HtmlComponent";
import { eventProxiCriteria } from "../../globals/globalfunctions";

/*
    This Class builds the class Variable Selector and adds the Eventhooks for it.
*/
class VariableSelectionBuilder {
  html: JQuery<HTMLElement>;
  linesWrapper: JQuery<HTMLElement>;
  ordersSelectHtml: JQuery<HTMLElement>;
  variablesOptionsSelect: JQuery<HTMLElement>;
  ParentComponent: any;
  otherSelectHtml: JQuery<HTMLElement>;
  constructor(ParentComponent: HTMLComponent) {
    this.ParentComponent = ParentComponent;
    this.html = $(form.sparnatural).find(".variablesSelection").first();
    this.linesWrapper = $('<div class="linesWrapper"></div>');
    this.ordersSelectHtml = $(
      '<div class="variablesOrdersSelect"><strong>' +
        getSettings().langSearch.labelOrderSort +
        '</strong> <a class="asc">' +
        UiuxConfig.ICON_AZ +
        '</a><a class="desc">' +
        UiuxConfig.ICON_ZA +
        '</a><a class="none selected">' +
        UiuxConfig.ICON_NO_ORDER +
        "</a></div>"
    );
    this.variablesOptionsSelect = $(
      '<div class="variablesOptionsSelect">' +
        getSettings().langSearch.SwitchVariablesNames +
        ' <label class="switch"><input type="checkbox"><span class="slider round"></span></label></div>'
    );
    this.otherSelectHtml = $('<div class="variablesOtherSelect"></div>');
  }

  render() {
    this.#addEventHooks();
    // first insert line 1
    $(this.html).append(
      this.linesWrapper.append(
        $('<div class="line1"></div>')
          .append($('<div class="variablesFirstSelect"></div>'))
          .append(this.otherSelectHtml)
      )
    );
    // then insert lin2
    this.linesWrapper.append(
      $('<div class="line2"></div>')
        .append(this.ordersSelectHtml)
        .append(this.variablesOptionsSelect)
    );
    //this.form.sparnatural.variablesSelector.switchLabel = "name"; // or name

    this.#renderShowHideBtn();
    this.#addSortable();
  }

  #addEventHooks() {
    this.variablesOptionsSelect.find("label, span").on(
      "click", // Listening when switch display variable
      { arg1: this, arg2: "switchVariableName" },
      eventProxiCriteria
    );
    // Listening when change sort order (AZ, ZA, None)
    this.ordersSelectHtml
      .find("a")
      .on(
        "change",
        { arg1: this, arg2: "changeOrderSort" },
        eventProxiCriteria
      );

    this.ordersSelectHtml.find("a").on("click", function () {
      if ($(this).hasClass("selected")) {
        //No change, make nothing
      } else {
        $(this).parent("div").find("a").removeClass("selected");
        $(this).addClass("selected");
        $(this).trigger("change");
      }
    });
  }

  #renderShowHideBtn() {
    //Show and hide button
    let selectorDisplay = $(
      '<div class="VariableSelectorDisplay"><a class="displayButton">' +
        UiuxConfig.ICON_ARROW_TOP +
        UiuxConfig.ICON_ARROW_BOTTOM +
        "</a></div>"
    );
    selectorDisplay
      .find("a")
      .on("click", { arg1: this, arg2: "display" }, eventProxiCriteria);
    $(this.html).append(selectorDisplay);
  }

  display() {
    if ($(this.html).hasClass("displayed")) {
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

    $(this.html).toggleClass("displayed");
  }

  #addSortable() {
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
        $(this).trigger("onUpdate");
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

    // add eventHook
    $(sortable).on(
      "onUpdate",
      { arg1: this, arg2: "updateVariableList" },
      eventProxiCriteria
    );
  }

  /**
   * Updates the variables in the generated query based on HTML variable line
   **/
  updateVariableList = function () {
    var listedItems = $(this.otherSelectHtml).find(".sortableItem>div");
    this.form.queryOptions.displayVariableList = [];
    for (var i = 0; i < listedItems.length; i++) {
      var variableName = $(listedItems[i]).attr("data-variablename");
      this.form.queryOptions.displayVariableList.push(variableName);
    }
    $(this.form.sparnatural).trigger("submit");
  };

  switchVariableName = function () {
    $(this.form.sparnatural)
      .find(".componentsListe")
      .first()
      .toggleClass("displayVarName");

    $("li.groupe").each(function () {
      redrawBottomLink($(this));
    });
  };

  changeOrderSort() {
    var selected = $(this.ordersSelectHtml).find("a.selected").first();
    var sort = null;
    if ($(selected).hasClass("desc")) {
      sort = "desc";
    }
    if ($(selected).hasClass("asc")) {
      sort = "asc";
    }
    this.form.queryOptions.orderSort = sort;
    $(this.form.sparnatural).trigger("submit");
  }
}

export default VariableSelectionBuilder;
