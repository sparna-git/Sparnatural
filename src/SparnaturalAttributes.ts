export class SparnaturalAttributes {
  src: any;
  endpoints: string[];
  language: string;
  defaultLanguage: string;
  addDistinct?: boolean;
  limit?: number;
  typePredicate: string = "<http://www.w3.org/1999/02/22-rdf-syntax-ns#type>";
  maxDepth: number;
  maxOr: number;
  sparqlPrefixes?: { [key: string]: string };
  localCacheDataTtl?: number;
  debug: boolean;
  submitButton?: boolean;
  catalog: string;

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
    this.catalog = this.#read(element, "catalog");
    this.language = this.#read(element, "lang");
    this.defaultLanguage = this.#read(element, "defaultLang");

    // use the singular to match RDFa attribute name
    this.sparqlPrefixes = this.#parsePrefixes(element);
    this.addDistinct = this.#read(element, "distinct", true);
    this.limit = this.#read(element, "limit", true);
    this.typePredicate = this.#read(element, "typePredicate");
    this.maxDepth = this.#read(element, "maxDepth");
    this.maxOr = this.#read(element, "maxOr");
    this.localCacheDataTtl = this.#read(element, "localCacheDataTtl", true);
    this.debug = this.#read(element, "debug", true);
    this.submitButton = this.#read(element, "submitButton", true);
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
