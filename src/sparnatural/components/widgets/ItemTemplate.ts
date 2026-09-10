import Handlebars from "handlebars";
import { SelectedVal } from "../SelectedVal";
import { RdfTermDatasourceItem } from "../datasources/DataProviders";
import { keepLinksClickable } from "./ItemLink";

// Optional Handlebars template to customize how datasource items are displayed in a widget.
// Read from an HTML element whose ID is the URI of the NodeShape targetted by the property,
// or the URI of the PropertyShape itself.
export class ItemTemplate {

  #compiled: HandlebarsTemplateDelegate | null = null;

  constructor(objectPropVal: SelectedVal, endClassVal: SelectedVal) {
    let element = findTemplateElement(objectPropVal, endClassVal);
    if (element) this.#compiled = Handlebars.compile(element.innerHTML);
  }

  // false when no template element is present in the page : widgets keep their default rendering
  get exists(): boolean {
    return this.#compiled !== null;
  }

  // rendered as-is : the template provides its own root element, so the page keeps
  // the class it styles next to its own CSS rules
  render(item: RdfTermDatasourceItem): string {
    if (!this.#compiled) throw new Error("No template available for rendering");
    return this.#compiled(item);
  }

  // same rendering as a DOM element, with the links it contains made clickable
  renderElement(item: RdfTermDatasourceItem): HTMLElement {
    let holder = document.createElement("div");
    holder.innerHTML = this.render(item);
    // a template with no element at all, or several, would lose content : fall back
    // on the holder, which then plays the root the template did not provide
    let element = (holder.children.length === 1
      ? holder.firstElementChild
      : holder) as HTMLElement;
    keepLinksClickable(element);
    return element;
  }
}

function findTemplateElement(
  objectPropVal: SelectedVal,
  endClassVal: SelectedVal
): HTMLElement | null {
  // the NodeShape template comes first, the PropertyShape one is a fallback
  for (let uri of [endClassVal?.type, objectPropVal?.type]) {
    let element = uri?document.getElementById(uri):null;
    if (element) return element;
  }
  return null;
}
