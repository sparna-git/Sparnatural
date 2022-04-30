import ActionsGroup from "../actions/ActionsGroup";
import ISettings from "../../../configs/client-configs/ISettings";
import StartClassGroup from "../startendclassgroup/StartClassGroup";
import { OptionsGroup } from "../optionsgroup/OptionsGroup";

import EndClassGroup from "../startendclassgroup/EndClassGroup";
import { findParentOrSiblingCriteria } from "../../globals/globalfunctions";
import EndClassWidgetGroup from "../widgets/EndClassWidgetGroup";
import { initGeneralEvent } from "../../globals/globalfunctions";
import HTMLComponent from "../HtmlComponent";
import { addComponent } from "../../globals/addComponent";
import ObjectPropertyGroup from "../objectpropertygroup/ObjectPropertyGroup";

/**
 * A single line/criteria
 **/

class CriteriaGroup extends HTMLComponent {
  thisForm_: any;
  ComponentHtml: any;
  AncestorComponentHtml: any;
  settings: any;
  liRef:JQuery<HTMLElement> // this holds a reference to the outer <li class="groupe..."> HTMLElement
  // JSON query line from which this line needs to be initialized
  jsonQueryBranch: any;
  context: {
    AncestorHtmlContext: any;
    HtmlContext: any;
    FormContext: any;
    ContextComponentIndex: any;
  };
  id: any;
  // create all the elements of the criteria
  StartClassGroup: any;
  OptionsGroup: any;
  ObjectPropertyGroup: any;
  EndClassGroup: any;
  EndClassWidgetGroup: any;
  ActionsGroup: any;
  specProvider: any;
  constructor(
    ParentComponent: HTMLComponent,
    context: {
      AncestorHtmlContext: any;
      HtmlContext: any;
      FormContext: any;
      ContextComponentIndex: any;
    },
    settings: ISettings,
    specProvider: any,
    jsonQueryBranch: any,
    liRef:JQuery<HTMLElement>
  ) {
    super("CriteriaGroup", ParentComponent, null);

    if(liRef.length === 0) throw Error("NO Reference to the outside <li> tag found.")
    this.liRef = liRef
    this.cssClasses.HasAllComplete = true;

    // IMPORTANT Check what has to come into the constructor
    this.ParentComponent = ParentComponent;
    this.context = context;
    this.thisForm_ = context.FormContext;
    this.ComponentHtml = context.HtmlContext;
    this.AncestorComponentHtml = context.AncestorHtmlContext;
    this.jsonQueryBranch = jsonQueryBranch;
    //TODO: Refactor to have only context variable and not for example this.thisForm_ = context.FormContext
    this.id = context.ContextComponentIndex;

    // Is this equals to widget html?
    this.html = $(
      '<div id="CriteriaGroup-' + this.id + '" class="CriteriaGroup"></div>'
    ).appendTo($(this.ComponentHtml));

    // create all the elements of the criteria
    this.StartClassGroup = new StartClassGroup(this, specProvider, settings).render();
    this.OptionsGroup = new OptionsGroup(this, specProvider).render();
    this.ObjectPropertyGroup = new ObjectPropertyGroup(
      this,
      specProvider,
      settings,
      settings.langSearch.ObjectPropertyTemporaryLabel
    ).render();
    this.EndClassGroup = new EndClassGroup(this, specProvider, settings).render();
    this.EndClassWidgetGroup = new EndClassWidgetGroup(
      this,
      settings,
      specProvider
    ).render();
    this.ActionsGroup = new ActionsGroup(this, specProvider, settings).render();
    this.assembleComponents();
  }
  //this._this = this ; IMPORTANT : unused var?
  children: Array<any> = [];

  assembleComponents = () => {
    // hook all components together
    $(this).on("StartClassGroupSelected", function () {
      this.ObjectPropertyGroup.onStartClassGroupSelected();
    });
    $(this).on("StartClassGroupSelected", function () {
      this.EndClassGroup.onStartClassGroupSelected();
    });
    $(this).on("Created", function () {
      this.StartClassGroup.onCreated();
    });
    $(this).on("EndClassGroupSelected", function () {
      this.ObjectPropertyGroup.onEndClassGroupSelected();
    });
    $(this).on("ObjectPropertyGroupSelected", function () {
      this.EndClassWidgetGroup.onObjectPropertyGroupSelected();
    });
    $(this).on("ObjectPropertyGroupSelected", function () {
      this.OptionsGroup.onObjectPropertyGroupSelected();
    });
    $(this).on("Created", function () {
      this.ActionsGroup.onCreated();
    });
    $(this).on("ObjectPropertyGroupSelected", function () {
      this.ActionsGroup.onObjectPropertyGroupSelected();
    });
  };

  onRemoveCriteria = () => {
    var index_to_remove = this.id;

    //RemoveSelectedVariable names
    if (this.EndClassGroup.variableSelector != null) {
      this.EndClassGroup.variableSelector.remove();
      this.EndClassGroup.variableSelector = null;
    }
    //Remove option selected if enbled
    if ($(this.html).parents("li").first().hasClass("optionalEnabled")) {
      $(this.html)
        .parents("li")
        .first()
        .parents("li.groupe")
        .each(function () {
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .addClass("Enabled");
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .removeClass("Disabled");
        });
      $(this.html)
        .parents("li")
        .first()
        .find("li.groupe")
        .each(function () {
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .addClass("Enabled");
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .removeClass("Disabled");
        });
    }
    // iterate on every "line" in the query
    $(this.thisForm_.sparnatural.components).each(function () {
      var parentOrSibling = findParentOrSiblingCriteria.call(
        this,
        this.CriteriaGroup.thisForm_,
        this.index
      );
      if (
        parentOrSibling.type != null &&
        parentOrSibling.type == "parent" &&
        parentOrSibling.element != null
      ) {
        // if the line is a child of the one to remove, remove it too
        var el = parentOrSibling.element as CriteriaGroup;
        if (el.id === index_to_remove) {
          this.CriteriaGroup.onRemoveCriteria();
        }
      }
    });

    var formObject = this.thisForm_;
    var formContextHtml = this.AncestorComponentHtml;

    // fetch parentOrSibling _before_ removing HTML and removing
    // component from list !!
    var parentOrSibling = findParentOrSiblingCriteria.call(
      this,
      this.thisForm_,
      this.id
    );

    // remove event listeners
    this.ComponentHtml.outerHTML = this.ComponentHtml.outerHTML; // IMPORTANT : does that actually do something?
    // remove the HTML
    $(this.ComponentHtml).remove();

    var iteration_to_remove = 0;
    $(this.thisForm_.sparnatural.components).each(function (i: number) {
      if (this.index === index_to_remove) {
        iteration_to_remove = i;
      }
    });
    // remove from list of components
    this.thisForm_.sparnatural.components.splice(iteration_to_remove, 1);

    if (this.thisForm_.sparnatural.components.length == 0) {
      // top-level criteria : add first criteria and trigger click on class selection
      var jsonQueryBranch = null;
      // if this is the very first criteria and there is a query to read, start from
      // the first branch
      if (this.thisForm_.preLoad !== false) {
        jsonQueryBranch = this.thisForm_.preLoad.branches[0];
      }

      $(".variablesOtherSelect .sortableItem").remove();

      var new_component = addComponent.call(
        this,
        formObject,
        formContextHtml,
        jsonQueryBranch
      );
      $(new_component)
        .find(".StartClassGroup .nice-select:not(.disabled)")
        .trigger("click");
    } else {
      if (parentOrSibling.element !== null) {
        var dependantComponent = parentOrSibling.element;
        if (dependantComponent) {
          if (
            $(dependantComponent.ComponentHtml).find("li.groupe").length > 0
          ) {
          } else {
            //Si pas d'enfant, on reaffiche le where action
            if (
              $(dependantComponent.ComponentHtml).hasClass("haveWhereChild")
            ) {
              $(dependantComponent.ComponentHtml).removeClass("haveWhereChild");
              $(dependantComponent.ComponentHtml).removeClass("completed");
            }
            $(dependantComponent.ComponentHtml).find(">ul.childsList").remove();
          }
        }
      }

      // re-submit form after deletion
      initGeneralEvent(this, formObject);
      $(this.thisForm_.sparnatural).trigger("submit");
    }

    return false;
  };

  initCompleted(){
    this.liRef.addClass("completed")
  };

}
export default CriteriaGroup;
