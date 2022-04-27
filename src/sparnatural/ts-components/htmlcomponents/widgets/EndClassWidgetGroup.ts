import ISettings from "../../../../configs/client-configs/ISettings";
import ObjectPropertyTypeWidget from "./ObjectPropertyTypeWidget";
import { AbstractValue } from "../../../sparql/Query";
import { Config } from "../../../../configs/fixed-configs/SparnaturalConfig";
import UiuxConfig from "../../../../configs/fixed-configs/UiuxConfig";
import CriteriaGroup from "../CriteriaGroup";
import { eventProxiCriteria } from "../../globals/globalfunctions";
import { initGeneralEvent } from "../../globals/globalfunctions";
import HTMLComponent from "../HtmlComponent";
import ISpecProvider from "../../../spec-providers/ISpecProviders";
import { TreeWidget } from "./Widgets";

class EndClassWidgetGroup extends HTMLComponent {
  ParentCriteriaGroup: CriteriaGroup;
  settings: ISettings;
  selectedValues: Array<any> = [];
  selectAllValue: boolean = true;
  VALUE_SELECTION_WIDGETS = [
    Config.LIST_PROPERTY,
    Config.LITERAL_LIST_PROPERTY,
    Config.AUTOCOMPLETE_PROPERTY,
    Config.TREE_PROPERTY,
  ];
  inputTypeComponent: ObjectPropertyTypeWidget;
  constructor(
    CriteriaGroup: CriteriaGroup,
    settings: ISettings,
    specProvider: ISpecProvider
  ) {
    super("EndClassWidgetGroup", CriteriaGroup, specProvider, null);
    this.settings = settings;
    this.inputTypeComponent = new ObjectPropertyTypeWidget(
      this,
      settings,
      specProvider
    );
    this.ParentCriteriaGroup = CriteriaGroup;
  }
  /**
   * Called when the property/link between domain and range is selected, to init this.
   **/
  onObjectPropertyGroupSelected() {
    console.warn("onObjectPropertyGroupSelected()");
    // Affichage de la ligne des actions
    this.ParentCriteriaGroup.ComponentHtml.addClass("OnEdit");

    // binds a selection in an input widget with the display of the value in the line
    $(this.inputTypeComponent).on(
      "change",
      {
        arg1: this,
        arg2: "onChange",
      },
      eventProxiCriteria
    );
    // binds a selection in an input widget with the display of the value in the line
    $(this.inputTypeComponent).on(
      "selectAll",
      {
        arg1: this,
        arg2: "onSelectAll",
      },
      eventProxiCriteria
    );
    // IMPORTANT changed the reinsert and init after the function bining onchange. otherwise selectedValues are empty cause only in onChange they are getting filled
    if (this.ParentCriteriaGroup.ActionsGroup.reinsert == true) {
      this.inputTypeComponent.reload();
    } else {
      this.inputTypeComponent.render();
    }
    if (this.ParentCriteriaGroup.jsonQueryBranch != null) {
      var branch = this.ParentCriteriaGroup.jsonQueryBranch;
      if (branch.line.values.length == 0) {
        if (branch.children.length == 0) {
          if (this.inputTypeComponent.canHaveSelectAll()) {
            this.onSelectAll();
          }
        }
      } else {
        for (var key in branch.line.values) {
          this.loadValue(branch.line.values[key]);
        }
      }
    }
  }

  // input : the 'key' of the value to be deleted
  onremoveValue(e: any) {
    if (this.selectAllValue) {
      //unselect the endClass for view
      this.ParentCriteriaGroup.EndClassGroup.onchangeViewVariable();
    }
    //On all case, selectAllValue will be set to false
    this.selectAllValue = false;

    var keyToBeDeleted = $(e.currentTarget).attr("value-data");
    this.selectedValues.filter((item) => {
      return item.key != keyToBeDeleted;
    }); //IMPORTANT check if this function works the same as the original one

    $(this.ParentCriteriaGroup.html)
      .find(".EndClassWidgetGroup .EndClassWidgetAddOrValue")
      .show();
    $(this.ParentCriteriaGroup.html).removeClass("onAddOrValue");

    $(e.currentTarget).parent("div").remove();

    //if jstree remove unselecteds term
    if (this.inputTypeComponent.widgetType == Config.TREE_PROPERTY) {
      (this.inputTypeComponent.widgetComponent as TreeWidget).jsTree.jstree(
        "uncheck_node",
        $(e.currentTarget).attr("value-data")
      );
    }
    //uncheck_node()

    if (this.selectedValues.length < 1) {
      $(this.ParentCriteriaGroup.ComponentHtml).removeClass("completed");
      $(this.ParentCriteriaGroup.html)
        .find(".EndClassWidgetGroup >.EndClassWidgetAddOrValue")
        .remove();
      $(this.ParentCriteriaGroup.html)
        .parent("li")
        .removeClass("WhereImpossible");
      // N'est plus à cacher, lutilisateur peut choisi d'afficher les valeurs
      //$(this.ParentCriteriaGroup.html).parent('li').removeClass('hideEndClassProperty') ;

      // re-enable Where action if end class can be connected to others
      if (
        this.ParentCriteriaGroup.EndClassGroup.specProvider.hasConnectedClasses(
          this.ParentCriteriaGroup.EndClassGroup.value_selected
        )
      ) {
        $(this.ParentCriteriaGroup.html)
          .parent("li")
          .removeClass("WhereImpossible");
      } else {
        $(this.ParentCriteriaGroup.html)
          .parent("li")
          .addClass("WhereImpossible");
      }

      // re-enable selection of property/link if there are multiple choices of properties
      if (
        $(this.ParentCriteriaGroup.ObjectPropertyGroup.html)
          .find(".input-val")
          .find("option").length > 1
      ) {
        $(this.ParentCriteriaGroup.ObjectPropertyGroup.html)
          .find(".input-val")
          .removeAttr("disabled")
          .niceSelect("update");
      } else {
        $(this.ParentCriteriaGroup.ObjectPropertyGroup.html)
          .find(".input-val")
          .attr("disabled", "disabled")
          .niceSelect("update");
      }

      // re-init the widget to empty input field
      this.inputTypeComponent.reload();
    }

    $(this.ParentCriteriaGroup).trigger("EndClassWidgetGroupUnselected");
    $(this.ParentCriteriaGroup.thisForm_.sparnatural).trigger("submit");

    initGeneralEvent.call(this, this.ParentCriteriaGroup.thisForm_);
  }

  loadValue = function loadValue(value: any) {
    this.inputTypeComponent.loadedValue =
      AbstractValue.valueToWidgetValue(value);
    $(this.inputTypeComponent).trigger("change");
    //Value added don't reuse preloaded data.
    this.inputTypeComponent.loadedValue = null;
  };

  onSelectAll() {
    var theValueLabel =
      "<span>" + this.settings.langSearch.SelectAllValues + "</span>";
    this.selectAllValue = true;
    let unselect = $(
      '<span class="unselect" value-data="allValues"><i class="far fa-times-circle"></i></span>'
    );
    if (
      $(this.ParentCriteriaGroup.html).find(".EndClassWidgetGroup>div")
        .length == 0
    ) {
      $(this.ParentCriteriaGroup.html)
        .find(".EndClassWidgetGroup")
        .append(
          $(
            '<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">' +
              UiuxConfig.COMPONENT_ARROW_BACK +
              "</div><p>" +
              theValueLabel +
              '</p><div class="componentFrontArrow">' +
              UiuxConfig.COMPONENT_ARROW_FRONT +
              "</div></div>"
          )
        )
        .find("div")
        .first()
        .append(unselect);
    }

    unselect.on(
      "click",
      { arg1: this, arg2: "onRemoveValue" },
      eventProxiCriteria
    );

    // disable the Where
    $(this.ParentCriteriaGroup.html).parent("li").addClass("WhereImpossible");
    $(this.ParentCriteriaGroup.html)
      .find(".EndClassGroup>div")
      .first()
      .removeClass("newOr");

    //Add variable on results view
    if (!this.ParentCriteriaGroup.EndClassGroup.notSelectForview) {
      if (this.ParentCriteriaGroup.EndClassGroup.variableSelector == null) {
        this.ParentCriteriaGroup.EndClassGroup.onchangeViewVariable();
      }
    }
    this.ParentCriteriaGroup.initCompleted();

    $(this.ParentCriteriaGroup).trigger("EndClassWidgetGroupSelected");
    $(this.ParentCriteriaGroup.thisForm_.sparnatural).trigger("submit");
    initGeneralEvent.call(this, this.ParentCriteriaGroup.thisForm_);
  }

  onChange() {
    var theValue = this.inputTypeComponent.getValue();
    // put span around with proper class if coming from a date widget

    if (theValue == null) {
      return false;
    }
    var new_items: any[] = [];
    if (
      this.inputTypeComponent.widgetType == Config.TREE_PROPERTY &&
      // when loading the value from a saved query, the value is not an array, it is
      // a simple value.
      Array.isArray(theValue)
    ) {
      for (var node in theValue) {
        var selected = false;
        // if the same value is already selected, don't do anything
        for (var item in this.selectedValues) {
          if (this.selectedValues[item].key == theValue[node].id) {
            selected = true;
          }
        }
        if (selected == false) {
          new_items.push(theValue[node]);
          this.selectedValues.push(theValue[node]);
        }
      }
      //Check if values removed
      for (var item in this.selectedValues) {
        var selected = false;
        for (var node in theValue) {
          if (this.selectedValues[item].key == theValue[node].id) {
            selected = true;
          }
        }
        if (selected == false) {
          $(this.ParentCriteriaGroup.html)
            .find(
              '.EndClassWidgetGroup span[value-data="' +
                this.selectedValues[item].key +
                '"]'
            )
            .first()
            .trigger("click");
        }
      }
    } else {
      // if the same value is already selected, don't do anything
      for (var item in this.selectedValues) {
        if (this.selectedValues[item].key == theValue.key) {
          return false;
        }
      }
      new_items.push(theValue);
      this.selectedValues.push(theValue);
    }

    // var value_data = (Array.isArray(theValue))?theValue.toString():theValue;

    for (var new_item in new_items) {
      theValue = new_items[new_item];

      var theValueLabel =
        "<span" +
        (theValue.start || theValue.stop ? ' class="label-two-line"' : "") +
        ">" +
        theValue.label +
        "</span>";

      let unselect = $(
        '<span class="unselect" value-data="' +
          theValue.key +
          '"><i class="far fa-times-circle"></i></span>'
      );
      if (
        $(this.ParentCriteriaGroup.html).find(".EndClassWidgetGroup>div")
          .length == 0
      ) {
        // set a tooltip if the label is a bit long
        var tooltip =
          theValue.label.length > 25 ? 'title="' + theValue.label + '"' : "";
        $(this.ParentCriteriaGroup.html)
          .find(".EndClassWidgetGroup")
          .append(
            $(
              '<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">' +
                UiuxConfig.COMPONENT_ARROW_BACK +
                "</div><p " +
                tooltip +
                ">" +
                theValueLabel +
                '</p><div class="componentFrontArrow">' +
                UiuxConfig.COMPONENT_ARROW_FRONT +
                "</div></div>"
            )
          )
          .find("div")
          .first()
          .append(unselect);

        if (
          this.VALUE_SELECTION_WIDGETS.indexOf(
            this.inputTypeComponent.widgetType
          ) !== -1
        ) {
          //if ($(this.ParentCriteriaGroup.html).find('.EndClassWidgetGroup>div').length == 1) { Now is sures, we have one
          $(this.ParentCriteriaGroup.html)
            .find(".EndClassWidgetGroup")
            .append(
              '<div class="EndClassWidgetAddOrValue flexWrap"><div class="componentBackArrow">' +
                UiuxConfig.COMPONENT_ARROW_BACK +
                '</div><p><span>+</span></p><div class="componentFrontArrow">' +
                UiuxConfig.COMPONENT_ARROW_FRONT +
                "</div></div>"
            );
          // hook a click on the plus to the needAddOrValue function
          $(this.ParentCriteriaGroup.html)
            .find(".EndClassWidgetGroup>.EndClassWidgetAddOrValue")
            .on(
              "click",
              { arg1: this, arg2: "onAddOrValue" },
              eventProxiCriteria
            );
          //}
        }
      } else {
        var temp_html = $(
          '<div class="EndClassWidgetValue flexWrap"><div class="componentBackArrow">' +
            UiuxConfig.COMPONENT_ARROW_BACK +
            "</div><p>" +
            theValueLabel +
            '</p><div class="componentFrontArrow">' +
            UiuxConfig.COMPONENT_ARROW_FRONT +
            "</div></div>"
        ).append(unselect);
        $(this.ParentCriteriaGroup.html)
          .find(".EndClassWidgetGroup >.EndClassWidgetAddOrValue")
          .before(temp_html);
      }

      // binds a click on the remove cross with the removeValue function
      unselect.on(
        "click",
        { arg1: this, arg2: "onRemoveValue" },
        eventProxiCriteria
      );
    }

    // disable the Where
    $(this.ParentCriteriaGroup.html).parent("li").addClass("WhereImpossible");
    $(this.ParentCriteriaGroup.html).removeClass("onAddOrValue");

    this.ParentCriteriaGroup.initCompleted();

    $(this.ParentCriteriaGroup).trigger("EndClassWidgetGroupSelected");
    $(this.ParentCriteriaGroup.thisForm_.sparnatural).trigger("submit");

    //Plus d'ajout possible si nombre de valeur suppérieur à l'option maxOr
    if (this.selectedValues.length == this.settings.maxOr) {
      $(this.ParentCriteriaGroup.html)
        .find(".EndClassWidgetGroup .EndClassWidgetAddOrValue")
        .hide();
    }

    if (this.selectedValues.length > 0) {
      $(this.ParentCriteriaGroup.ObjectPropertyGroup.html)
        .find(".input-val")
        .attr("disabled", "disabled")
        .niceSelect("update");
    }

    $(this.ParentCriteriaGroup.html)
      .find(".EndClassGroup>.EditComponents")
      .removeClass("newOr");
    initGeneralEvent.call(
      this,
      this.ParentCriteriaGroup.thisForm_,
      this.settings
    );
  }
}
export default EndClassWidgetGroup;
