export class SparnaturalHistoryAttributes {
  language: string;
  defaultLanguage: string;

  constructor(element: HTMLElement) {
    this.language = this.#read(element, "lang");
    this.defaultLanguage = this.#read(element, "defaultLang");
  }

  #read(element: HTMLElement, attribute: string, asJson: boolean = false) {
    return element.getAttribute(attribute)
      ? asJson
        ? JSON.parse(element.getAttribute(attribute))
        : element.getAttribute(attribute)
      : undefined;
  }
}
