import ISettings from "../../configs/client-configs/ISettings";
import { getSettings } from "../../configs/client-configs/settings";
import BaseClassFactory from "./baseClassFactory/BaseClassFactory";


interface IRenderable {
  render: () => this;
}
class HTMLComponent implements IRenderable {
  baseCssClass: string;
  static BaseClassFactory = new BaseClassFactory();
  settings: ISettings = getSettings();

  ParentComponent: HTMLComponent;
  widgetHtml: JQuery<HTMLElement>;
  html: JQuery<HTMLElement>;
  // TODO this is only temporarly. Some components (ActionWhere) don't need to be attached on there parentcomponent but somewhere else
  htmlParent: JQuery<HTMLElement> = null;

  constructor(
    baseCssClass: string,
    ParentComponent: HTMLComponent,
    widgetHtml: JQuery<HTMLElement>
  ) {
    this.baseCssClass = baseCssClass;
    this.html = HTMLComponent.BaseClassFactory.getBaseClass(this.baseCssClass);
    this.baseCssClass = baseCssClass;
    this.ParentComponent = ParentComponent;
    this.widgetHtml = widgetHtml;
  }

  #attachComponentHtml() {
    $(this.html).appendTo(this.ParentComponent.html);
  }

  #initHtml() {
    if (this.widgetHtml != null) {
      // remove existing html
      this.html = HTMLComponent.BaseClassFactory.getBaseClass(
        this.baseCssClass
      );
      this.html.append(this.widgetHtml);
    } else {
      this.html = HTMLComponent.BaseClassFactory.getBaseClass(
        this.baseCssClass
      );
    }
  }

  render() {
    if (this.html != null){
      this.html.remove();
      this.html.empty()
    }
    this.#initHtml();
    this.#attachComponentHtml();
    return this;
  }
}
export default HTMLComponent;
