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

  // wrapped in a single element so that multi-node templates are not truncated by the caller
  render(item: RdfTermDatasourceItem): string {
    if (!this.#compiled) throw new Error("No template available for rendering");
    return `<div class="item-template">${this.#compiled(item)}</div>`;
  }

  // same rendering as a DOM element, with the links it contains made clickable
  renderElement(item: RdfTermDatasourceItem): HTMLElement {
    let holder = document.createElement("div");
    holder.innerHTML = this.render(item);
    let element = holder.firstElementChild as HTMLElement;
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
