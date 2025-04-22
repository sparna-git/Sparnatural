/*
    This is the green arrow which gets rendered. Pressing the arrow renders the Optional and NotExist component
*/

import UiuxConfig from "../IconsConstants";
import { OptionsGroup } from "../builder-section/groupwrapper/criteriagroup/optionsgroup/OptionsGroup";
import { HTMLComponent } from "../HtmlComponent";

export class OptionalArrow extends HTMLComponent {
  selected = false;
  callBack: (selected: boolean) => void;
  constructor(
    ParentComponent: OptionsGroup,
    callBack: (selected: boolean) => void
  ) {
    let widgetHtml = $(UiuxConfig.COMPONENT_OPTION_ARROW_FRONT);
    super("optionalArrow", ParentComponent, widgetHtml);
    this.callBack = callBack;
  }
  render(): this {
    super.render();
    this.widgetHtml.on("click", (e: JQuery.ClickEvent) => {
      e.stopImmediatePropagation();
      this.selected = this.selected ? false : true;
      this.callBack(this.selected);
    });
    return this;
  }
}
