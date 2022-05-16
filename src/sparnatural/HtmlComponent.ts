import ISettings from "../configs/client-configs/ISettings";
import { getSettings } from "../configs/client-configs/settings";
import BaseClassFactory from "./components/baseClassFactory/BaseClassFactory";


interface IRenderable{
  render: () => this
}
class HTMLComponent implements IRenderable {
  baseCssClass: string;
  static BaseClassFactory = new BaseClassFactory()
  settings:ISettings = getSettings()

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
    this.baseCssClass = baseCssClass
    this.html = HTMLComponent.BaseClassFactory.getBaseClass(this.baseCssClass)
    this.baseCssClass =baseCssClass;
    this.ParentComponent = ParentComponent;
    this.widgetHtml = widgetHtml;
  }

  #attachComponentHtml() {
    // sometimes components don't need to be rendered under their parentcomponent but under htmlParent... like ActionWhere
    if (this.htmlParent) {
      // remove existing component if already existing
      //if(this.ParentComponent.html) this.htmlParent.find(">." + this.baseCssClass).remove();
      this.htmlParent.append(this.html)
    } else {
      // remove existing component if already existing
      //if(this.ParentComponent.html) this.ParentComponent.html.find(">." + this.baseCssClass).remove();
      
      $(this.html).appendTo(this.ParentComponent.html);
    }
  }

  remove() {
    $(this.html).remove();
  }

  #initHtml() {
    if (this.widgetHtml != null) {
      // remove existing component
      this.html = HTMLComponent.BaseClassFactory.getBaseClass(this.baseCssClass)
      this.html.append(this.widgetHtml);
    } else {
      this.html = HTMLComponent.BaseClassFactory.getBaseClass(this.baseCssClass)
    }
  }

  updateWidgetHtml(newWidgetHtml:JQuery<HTMLElement>){
    this.html.remove(this.widgetHtml.toString())
    this.widgetHtml = newWidgetHtml
    this.html.append(this.widgetHtml)
  }

  render() {
      if(this.html != null) this.html.remove()
      this.#initHtml();
      this.#attachComponentHtml();
      this.html.addClass('isOnEdit')
      this.html.addClass('Created')
      return this
  }
}
export default HTMLComponent;
