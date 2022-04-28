import {
  eventProxiCriteria,
  redrawBottomLink,
} from "../globals/globalfunctions";
import UiuxConfig from "../../../configs/fixed-configs/UiuxConfig";
import OptionTypeId from "./OptionTypeId";
import CriteriaGroup from "./CriteriaGroup";
import HTMLComponent from "./HtmlComponent";
import ISpecProvider from "../../spec-providers/ISpecProviders";
import ArrowComponent from "./arrows/ArrowComponent";

/**
 * Selection of the start class in a criteria/line
 **/
export class OptionsGroup extends HTMLComponent {
  ParentCriteriaGroup: CriteriaGroup;
  valuesSelected: { [key: string]: boolean };
  inputTypeComponent: OptionTypeId;
  frontArrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_FRONT)
  backArrow:ArrowComponent = new ArrowComponent(this,UiuxConfig.COMPONENT_ARROW_BACK)
  constructor(ParentCriteriaGroup: CriteriaGroup, specProvider: ISpecProvider) {
    super("OptionsGroup", ParentCriteriaGroup, specProvider, null);
    this.valuesSelected = {};
    this.ParentCriteriaGroup = ParentCriteriaGroup as CriteriaGroup;
    this.inputTypeComponent = new OptionTypeId(this, specProvider);
    this.backArrow.cssClasses.Invisible = true
    this.frontArrow.cssClasses.Invisible = true

  }
  //TODO refactor to render()
  // still necessary after refactoring the EndClassGroup on remove selected?
  render() {
    super.render()
    this.backArrow.render()

    if ($(this.html).find(".EditComponents").first().hasClass("Enabled")) {
      $(this.html).removeClass("Opended");
      redrawBottomLink($(this.html).parents("li.groupe").first());
    }
    $(this.html).removeClass("Disabled");
    $(this.html).removeClass("NoOptionEnabled");
    $(this.html).removeClass("Enabled");
    $(this.html).removeClass("ShowOnEdit");
    $(this.html).first().unbind("click");
    $(this.html).find(".input-val input").unbind("click");
    $(this.html).find(".input-val label").unbind("click");
    // if there were values selected delete it
    this.valuesSelected = {};
    this.frontArrow.render() // init the Front arrow needs to be rendered after the ParentComponent e.g this
    return this
  }

  onObjectPropertyGroupSelected() {
    if ($(this.html).hasClass("ShowOnEdit")) {
      console.log('OptionsGroup first if')
      $(this.html).addClass("ShowOnEdit");
      var parentOptionEnable = false;
      $(this.html)
        .parents("li.groupe")
        .each(function () {
          if ($(this).hasClass("optionEnabled")) {
            parentOptionEnable = true;
          }
        });

      if (
        parentOptionEnable ||
        (!this.specProvider.isEnablingOptional(
          this.ParentCriteriaGroup.ObjectPropertyGroup.value_selected
        ) &&
          !this.specProvider.isEnablingNegation(
            this.ParentCriteriaGroup.ObjectPropertyGroup.value_selected
          ))
      ) {
        console.log('optionsgroup second if')
        $(this.html).addClass("Disabled");
        $(this.html).removeClass("NoOptionEnabled");
        $(this.ParentCriteriaGroup.html).addClass("OptionMenuShowed");
        // check if it is possible to enable optional and negatif values
        if (
          !this.specProvider.isEnablingOptional(
            this.ParentCriteriaGroup.ObjectPropertyGroup.value_selected
          ) &&
          !this.specProvider.isEnablingNegation(
            this.ParentCriteriaGroup.ObjectPropertyGroup.value_selected
          )
        ) {
          $(this.html).addClass("NoOptionEnabled");
          $(this.ParentCriteriaGroup.html).removeClass("OptionMenuShowed");
        }
      } else {
        console.log(console.log('optionsgroup second else'))
        $(this.html).addClass("Enabled");
        $(this.ParentCriteriaGroup.html).addClass("OptionMenuShowed");
      }

      $(this.html)
        .on("click", function (e) {
          if (
            $(e.target).hasClass("Enabled")
          ) {
            $(e.target).toggleClass("Opended");
            redrawBottomLink($(e.target).parents("li.groupe").first());
          }
        });

      this.inputTypeComponent.render();
      this.inputTypeComponent.cssClasses.IsOnEdit = true;

      $(this.html)
        .find(".input-val label")
        .on("click", function (e) {
          $(this).addClass("justClicked");
        });
      $(this.html)
        .find(".input-val input")
        .on("click", function (e) {
          e.stopPropagation();
        });
      $(this.html)
        .find(".input-val label")
        .on("click", { arg1: this, arg2: "onChange" }, eventProxiCriteria);

      if (this.inputTypeComponent.needTriggerClick == true) {
        if (this.inputTypeComponent.default_value["optional"]) {
          // pour ouvrir le menu :
          $(this.html).find(".componentBackArrow").first().trigger("click");
          // pour selectionner l'option
          $(this.html)
            .find('.input-val input[data-id="optional"]')
            .parents("label")
            .first()
            .trigger("click");
        } else if (this.inputTypeComponent.default_value["notExists"]) {
          // pour ouvrir le menu :
          $(this.html).find(".componentBackArrow").first().trigger("click");
          // pour selectionner l'option
          $(this.html)
            .find('.input-val input[data-id="notExists"]')
            .parents("label")
            .first()
            .trigger("click");
        }
        this.inputTypeComponent.needTriggerClick = false;
      }
    }
  }

    //This method only gets called on StartClassGroup.InputTypeComponent
  // When the EndClassGroup is selected, then change the Front arrow to the back arrow
  renderOptionalBackArrow(){
    this.backArrow = new ArrowComponent(this,UiuxConfig.COMPONENT_OPTION_ARROW_FRONT)
    this.render()
  }

  onChange() {
    console.warn("OptionsGroup onChange called")
    var optionsInputs = $(this.html).find(".input-val input").get();
    var optionSelected = false;
    for (var item in optionsInputs) {
      if (
        $(optionsInputs[item]).parents("label").first().hasClass("justClicked")
      ) {
        let dataid = $(optionsInputs[item]).attr("data-id");
        if (this.valuesSelected[dataid] !== true) {
          this.valuesSelected[dataid] = true;
          $(optionsInputs[item]).parents("label").first().addClass("Enabled");
          optionSelected = true;
          $(optionsInputs[item])
            .parents("li.groupe")
            .first()
            .addClass($(optionsInputs[item]).attr("data-id") + "-enabled");
        } else {
          this.valuesSelected[dataid] = false;
          $(optionsInputs[item])
            .parents("label")
            .first()
            .removeClass("Enabled");
          optionsInputs[item].setAttribute("check", "false"); //IMPORTANT Check if this does the same thing as the original code?
          $(optionsInputs[item])
            .parents("li.groupe")
            .first()
            .removeClass($(optionsInputs[item]).attr("data-id") + "-enabled");
        }
      } else {
        this.valuesSelected[$(optionsInputs[item]).attr("data-id")] = false;
        $(optionsInputs[item]).parents("label").first().removeClass("Enabled");
        $(optionsInputs[item])
          .parents("li.groupe")
          .first()
          .removeClass($(optionsInputs[item]).attr("data-id") + "-enabled");
      }
    }

    if (optionSelected == true) {
      $(this.ParentCriteriaGroup.html)
        .parents("li")
        .first()
        .addClass("optionEnabled");
      $(this.ParentCriteriaGroup.html)
        .parents("li")
        .first()
        .parents("li.groupe")
        .each(function () {
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .addClass("Disabled");
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .removeClass("Enabled");
          $(this).find(">div>.OptionsGroup").first().removeClass("Opended");
        });
      $(this.ParentCriteriaGroup.html)
        .parents("li")
        .first()
        .find("li.groupe")
        .each(function () {
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .addClass("Disabled");
          $(this)
            .find(">div>.OptionsGroup")
            .first()
            .removeClass("Enabled");
          $(this).find(">div>.OptionsGroup").first().removeClass("Opended");
        });
      $("li.groupe").each(function () {
        redrawBottomLink($(this));
      });
    } else {
      $(this.ParentCriteriaGroup.html)
        .parents("li")
        .first()
        .removeClass("optionEnabled");
      $(this.ParentCriteriaGroup.html)
        .parents("li")
        .first()
        .parents("li.groupe")
        .each(function () {
          if ($(this).find(">div>.OptionsGroup label").length > 0) {
            $(this)
              .find(">div>.OptionsGroup")
              .first()
              .addClass("Enabled");
            $(this)
              .find(">div>.OptionsGroup")
              .first()
              .removeClass("Disabled");
          }
        });
      $(this.ParentCriteriaGroup.html)
        .parents("li")
        .first()
        .find("li.groupe")
        .each(function () {
          if ($(this).find(">div>.OptionsGroup label").length > 0) {
            $(this)
              .find(">div>.OptionsGroup")
              .first()
              .addClass("Enabled");
            $(this)
              .find(">div>.OptionsGroup")
              .first()
              .removeClass("Disabled");
          }
        });
    }

    // update the query
    $(this.ParentCriteriaGroup.thisForm_.sparnatural).trigger("submit");

    $(this.html).find(".input-val label").removeClass("justClicked");
  }
}
