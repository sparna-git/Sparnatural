import { Form } from "./sparnatural-form/FormStructure";
import { SparnaturalFormElement } from "./SparnaturalFormElement";

/**
 * Reads the HTML attributes of the sparnatural-form element
 */
export class SparnaturalFormAttributes {
  src: any;
  defaultEndpoint: string;
  query: string;
  form: string;
  endpoints?: string[];
  limit: number;
  language: string;
  defaultLanguage: string;
  debug: boolean;
  catalog: string;
  sparqlPrefixes?: { [key: string]: string };
  formConfig: Form;

  typePredicate = "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>";

  constructor(element: HTMLElement) {
    // not the differences in attribute names
    this.src = this.#read(
      element,
      "src",
      this.#isJSON(element.getAttribute("src"))
    );
    if (!this.src) {
      throw Error("No src provided!");
    }

    let endpointParam = this.#read(element, "endpoint");
    this.endpoints = endpointParam.split(" ");
    if (!this.endpoints) {
      throw Error("No endpoint provided!");
    }

    this.query = this.#read(element, "query");
    if (!this.query) {
      throw Error("No query provided!");
    }

    this.form = this.#read(element, "form");
    if (!this.form) {
      throw Error("No form config provided!");
    }

    this.sparqlPrefixes = this.#parsePrefixes(element);
    this.catalog = this.#read(element, "catalog");
    this.limit = this.#read(element, "limit", true);
    this.language = this.#read(element, "lang");
    this.debug = this.#read(element, "debug", true);
    this.defaultLanguage = this.#read(element, "defaultLang");
  }

  #read(element: HTMLElement, attribute: string, asJson: boolean = false) {
    return element.getAttribute(attribute)
      ? asJson
        ? JSON.parse(element.getAttribute(attribute))
        : element.getAttribute(attribute)
      : undefined;
  }

  #parsePrefixes(element: HTMLElement) {
    if (!element.getAttribute("prefixes")) {
      return;
    }

    let sparqlPrefixes = {};
    // use the singular to match RDFa attribute name
    let prefixArray = element
      .getAttribute("prefixes")
      .trim()
      .split(/:\s+|\s+/);
    for (let i = 0; i < prefixArray.length; i++) {
      try {
        const prefixPair = {
          prefix: prefixArray[i].split(":")[0],
          iri: prefixArray[i].split(":").slice(1).join(":"),
        };
        Object.defineProperty(sparqlPrefixes, prefixPair.prefix, {
          value: prefixPair.iri,
          writable: true,
          enumerable: true,
        });
      } catch (e) {
        console.error("Parsing of attribute prefixes failed!");
        console.error(`Can not parse ${prefixArray[i]}`);
      }
    }

    return sparqlPrefixes;
  }

  #isJSON = (json: string) => {
    let is_json = true; //true at first

    // Check if config is given as JSON string or as URL
    try {
      JSON.parse(json);
    } catch (error) {
      is_json = false;
    }
    return is_json;
  };
}
