import Handlebars from "handlebars";
import { SelectedVal } from "../SelectedVal";
import { RdfTermDatasourceItem } from "../datasources/DataProviders";
import { keepLinksClickable } from "./ItemLink";

// Optional Handlebars template to customize how datasource items are displayed in a widget.
// Read from an HTML element whose ID is the URI of the NodeShape targetted by the property,
// or the URI of the PropertyShape itself, or else the page-wide default template.
export class ItemTemplate {
  #compiled: HandlebarsTemplateDelegate | null = null;

  constructor(objectPropVal: SelectedVal, endClassVal: SelectedVal) {
    let element = findTemplateElement(objectPropVal, endClassVal);
    if (element) this.#compiled = Handlebars.compile(element.innerHTML);
  }

  // false when no template applies, not even the default
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
    let element = (
      holder.children.length === 1 ? holder.firstElementChild : holder
    ) as HTMLElement;
    keepLinksClickable(element);
    return element;
  }
}

// applies to every list, autocomplete and tree widget that has no template of its own
const DEFAULT_TEMPLATE_ID = "default-template";

function findTemplateElement(
  objectPropVal: SelectedVal,
  endClassVal: SelectedVal,
): HTMLElement | null {
  // the NodeShape template comes first, then the PropertyShape one, then the page default
  for (let id of [
    endClassVal?.type,
    objectPropVal?.type,
    DEFAULT_TEMPLATE_ID,
  ]) {
    let element = id ? document.getElementById(id) : null;
    if (element) return element;
  }
  return null;
}
