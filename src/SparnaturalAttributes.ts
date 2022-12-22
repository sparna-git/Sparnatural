export class SparnaturalAttributes {
  config: any;
  defaultEndpoint: string;
  language?: string;
  addDistinct?: boolean;
  limit?: number;
  typePredicate?: string;
  maxDepth: number;
  maxOr: number;
  backgroundBaseColor?: string; //TODO '250,136,3'
  sparqlPrefixes?: { [key: string]: string };
  localCacheDataTtl?: number;
  debug: boolean;
  submitButton?: boolean;

  constructor(element:HTMLElement) {
    // not the differences in attribute names
    this.config = this.#read(element,"src",this.#isJSON(element.getAttribute('src')));
    this.defaultEndpoint = this.#read(element, "endpoint");
    if(!this.config || !this.defaultEndpoint) {
      throw Error('No config or deault endpoint provided!');
    }
    this.language = this.#read(element, "lang");
    // use the singular to match RDFa attribute name
    this.sparqlPrefixes = this.#parsePrefixes(element);
    this.addDistinct = this.#read(element, "distinct", true);
    this.limit = this.#read(element, "limit", true);
    this.typePredicate = this.#read(element, "typePredicate");
    this.maxDepth = this.#read(element, "maxDepth");
    this.maxOr = this.#read(element, "maxOr");
    this.backgroundBaseColor = this.#read(element, "backgroundbaseColor");
    this.localCacheDataTtl = this.#read(element, "localCacheDataTtl", true);
    this.debug = this.#read(element, "debug", true);
    this.submitButton = this.#read(element, "submitButton", true);
  }

  #read(element:HTMLElement, attribute:string, asJson:boolean = false) {
    return element.getAttribute(attribute)?(asJson)?JSON.parse(element.getAttribute(attribute)):element.getAttribute(attribute):undefined
  }

  #parsePrefixes(element:HTMLElement) {
    if(!element.getAttribute("prefix")) {
      return;
    }

    let sparqlPrefixes = {};
    let prefixArray = element.getAttribute("prefix").trim().split(/:\s+|\s+/);
    for (let i = 0; i < prefixArray.length; i = i + 2) {
      Object.defineProperty(sparqlPrefixes, prefixArray[i], {
          value: prefixArray[i + 1].toLocaleLowerCase(),
          writable: true
      })
    }

    return sparqlPrefixes;
  }
  #isJSON =(json:string)=> {

    let is_json = true; //true at first

    // Check if config is given as JSON string or as URL
    try {
      JSON.parse(json);
    } catch (error) {
        is_json = false;
    }
    return is_json
  }

}