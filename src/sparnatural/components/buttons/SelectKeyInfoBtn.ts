import { HTMLComponent } from "../HtmlComponent";

export class SelectKeyInfoBtn extends HTMLComponent {

  visible = false;
  selected = false;
  callBack;
  
  constructor(
    ParentComponent: HTMLComponent,
    callBack: (selected: boolean) => void
  ) {
    const widgetHtml = SelectKeyInfoBtn.buildInnerLabel();
    super("selectKeyInfoBtn", ParentComponent, widgetHtml);
    this.callBack = callBack;
  }

  render() {
    this.widgetHtml = SelectKeyInfoBtn.buildInnerLabel();
    super.render();
    // apply state on the ROOT element (created by BaseClassFactory)
    const pressed = this.selected ? "true" : "false";
    this.html
      .attr("role", "button")
      .attr("aria-pressed", pressed)
      .attr("tabindex", "0")
      .toggleClass("is-selected", this.selected);
    this.#addClickListener();

    if(!this.visible) {
      this.html.hide();
    }
    
    return this;
  }


  #addClickListener() {
    // bind on the ROOT element so re-renders don't duplicate nested containers
    this.html.on("click", (e: JQuery.ClickEvent) => {
      this.selected = !this.selected;
      this.render();
      this.callBack(this.selected);
    });
  }

  show() {
    this.visible = true;
    this.render();
  }

  hide() {
    this.visible = false;
    this.render();
  }

  click() {
    this.html[0].dispatchEvent(new Event("click"))
  }

  private static buildInnerLabel() {
    return $('<span class="label">+ info</span>');
  }

}
