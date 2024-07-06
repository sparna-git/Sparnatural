export class SparnaturalFormAttributes {
  src: any;
  defaultEndpoint: string;
  query: string;
  form: string;

  language: string;
  defaultLanguage: string;
  debug: boolean;
  catalog: string;

  constructor(element:HTMLElement) {
    // not the differences in attribute names
    this.src = this.#read(element,"src",this.#isJSON(element.getAttribute('src')));    
    if(!this.src) {
      throw Error('No src provided!');
    }
    this.defaultEndpoint = this.#read(element, "endpoint");
    if(!this.defaultEndpoint) {
      throw Error('No endpoint provided!');
    }
    this.catalog = this.#read(element, "catalog");
    this.language = this.#read(element, "lang");
    this.defaultLanguage = this.#read(element, "defaultLang");

    this.query = this.#read(element, "query");
    if(!this.query) {
      throw Error('No query provided!');
    }

    this.form = this.#read(element, "form");
    if(!this.form) {
      throw Error('No form config provided!');
    }

    this.debug = this.#read(element, "debug", true);
    
  }

  #read(element:HTMLElement, attribute:string, asJson:boolean = false) {
    return element.getAttribute(attribute)?(asJson)?JSON.parse(element.getAttribute(attribute)):element.getAttribute(attribute):undefined
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