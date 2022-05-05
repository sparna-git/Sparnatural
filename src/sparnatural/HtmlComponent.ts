import ISettings from "../configs/client-configs/ISettings";
import { getSettings } from "../configs/client-configs/settings";
import BaseClassFactory from "./components/baseClassFactory/BaseClassFactory";


interface IRenderable{
  render: () => this
}
interface IcssClasses {
  TreeWidget?: boolean;
  BooleanWidget?: boolean;
  NoWidget?: boolean;
  DatesWidget?: boolean; //typo? plural?
  TimeDatePickerWidget?: boolean;
  HasInputsCompleted: boolean;
  IsOnEdit?: boolean;
  Invisible?: boolean;
  Created?: boolean;
  ShowOnHover?: boolean;
  ShowOnEdit?: boolean;
  HasAllComplete?: boolean;
  ListeWidget?: boolean; // TODO ListWidget or ListEWidget? typo?
  AutocompleteWidget?: boolean; //typo?
  SearchWidget?: boolean;
  Highlited?: boolean;
  flexWrap?: boolean;
  disable?: boolean
}

class HTMLComponent implements IRenderable {
  baseCssClass: string;
  cssClasses: IcssClasses = {
    HasInputsCompleted: false,
    IsOnEdit: false,
    Invisible: false,
    //Created: false, // each component starts uncreated. init() will change it
  };
  settings:ISettings = getSettings()

  ParentComponent: HTMLComponent;
  widgetHtml: JQuery<HTMLElement>;
  html: JQuery<HTMLElement>;
  // TODO this is only temporarly. Some components (ActionWhere) don't need to be attached on there parentcomponent but somewhere else
  htmlParent: JQuery<HTMLElement> = null;
  BaseClassFactory = new BaseClassFactory()
  constructor(
    baseCssClass: any,
    ParentComponent: HTMLComponent,
    widgetHtml: JQuery<HTMLElement>
  ) {
    this.baseCssClass = baseCssClass;
    this.ParentComponent = ParentComponent;
    this.widgetHtml = widgetHtml;
    this.html = this.BaseClassFactory.getBaseClass(this.baseCssClass)
    this.html.append(this.widgetHtml);
  }

  #attachComponentHtml() {
    // sometimes components don't need to be rendered under their parentcomponent but under htmlParent... like ActionWhere
    if (this.htmlParent) {
      // remove existing component if already existing
      this.htmlParent.find(">." + this.baseCssClass).remove();
      this.htmlParent.append(this.html)
    } else {
      //console.dir(`attaching:${this.html} to ${this.ParentComponent}`)
      //console.dir(this.html)
      //console.dir(this.ParentComponent)
      // remove existing component if already existing
      this.ParentComponent.html.find(">." + this.baseCssClass).remove();
      $(this.html).appendTo(this.ParentComponent.html);
    }
  }

  remove() {
    $(this.html).remove();
  }

  #initHtml() {
    if (this.widgetHtml != null) {
      // remove existing component
      this.html = this.BaseClassFactory.getBaseClass(this.baseCssClass)
      this.html.append(this.widgetHtml);
    } else {
      this.html = this.BaseClassFactory.getBaseClass(this.baseCssClass)
    }
  }

  updateWidgetHtml(newWidgetHtml:JQuery<HTMLElement>){
    this.html.remove(this.widgetHtml.toString())
    this.widgetHtml = newWidgetHtml
    this.html.append(this.widgetHtml)
  }

  render() {
      this.html.addClass('isOnEdit')
      this.#initHtml();
      this.#attachComponentHtml();
      this.html.addClass('Created')
      return this
  }
}
export default HTMLComponent;
