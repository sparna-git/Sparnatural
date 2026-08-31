import Handlebars from "handlebars";
import { SelectedVal } from "../SelectedVal";
import { RdfTermDatasourceItem } from "../datasources/DataProviders";

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
