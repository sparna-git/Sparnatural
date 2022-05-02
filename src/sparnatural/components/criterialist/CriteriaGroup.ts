import ActionsGroup from "../actions/ActionsGroup";
import ISettings from "../../../configs/client-configs/ISettings";
import StartClassGroup from "../startendclassgroup/StartClassGroup";
import { OptionsGroup } from "../optionsgroup/OptionsGroup";

import EndClassGroup from "../startendclassgroup/EndClassGroup";
import EndClassWidgetGroup from "../widgets/EndClassWidgetGroup";
import HTMLComponent from "../../HtmlComponent";
import ObjectPropertyGroup from "../objectpropertygroup/ObjectPropertyGroup";
import CriteriaList from "./GroupWrapper";
import GroupWrapper from "./GroupWrapper";

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
  ParentCriteriaList: CriteriaList;
  constructor(
    ParentComponent: GroupWrapper,
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
    this.ParentCriteriaList = ParentComponent as CriteriaList;
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
      settings.langSearch.ObjectPropertyTemporaryLabel
    ).render();
    this.EndClassGroup = new EndClassGroup(this, specProvider).render();
    this.EndClassWidgetGroup = new EndClassWidgetGroup(
      this,
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

  initCompleted(){
    this.liRef.addClass("completed")
  };

}
export default CriteriaGroup;
