import { getSettings } from "./sparnatural-form/settings/defaultsSettings";
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

  sparnatural: SparnaturalFormElement;

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
    this.sparnatural = document.querySelector(
      "sparnatural-form"
    ) as SparnaturalFormElement;

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.attributeName === "lang") {
          const newLang = element.getAttribute("lang");
          this.language = newLang; // Met à jour la langue dans les paramètres
          console.log("Language changed dynamically to:", newLang);

          // Relancer l'affichage pour mettre à jour l'interface
          this.updateLanguage(newLang);
        }
      });
    });

    observer.observe(element, {
      attributes: true, // Observez les changements d'attribut
      attributeFilter: ["lang"], // Spécifier l'attribut à observer
    });

    let endpointParam = this.#read(element, "endpoint");
    this.endpoints = endpointParam.split(" ");

    if (!this.endpoints) {
      throw Error("No endpoint provided!");
    }
    this.sparqlPrefixes = this.#parsePrefixes(element);
    this.catalog = this.#read(element, "catalog");
    this.limit = this.#read(element, "limit", true);
    this.language = this.#read(element, "lang");
    this.debug = this.#read(element, "debug", true);
    this.defaultLanguage = this.#read(element, "defaultLang");

    this.query = this.#read(element, "query");
    if (!this.query) {
      throw Error("No query provided!");
    }

    this.form = this.#read(element, "form");
    if (!this.form) {
      throw Error("No form config provided!");
    }

    this.debug = this.#read(element, "debug", true);
  }
  updateLanguage(newLang: string) {
    const settings = getSettings();
    settings.language = newLang; // Met à jour la langue courante

    // Relancer l'affichage de l'interface (réinitialisation des labels)
    this.sparnatural.display(); // Ou la méthode qui réinitialise l'affichage
  }

  #read(element: HTMLElement, attribute: string, asJson: boolean = false) {
    return element.getAttribute(attribute)
      ? asJson
        ? JSON.parse(element.getAttribute(attribute))
        : element.getAttribute(attribute)
      : undefined;
  }

  #parsePrefixes(element: HTMLElement) {
    if (!element.getAttribute("prefix")) {
      console.error("No prefixes provided!");
      return;
    }

    let sparqlPrefixes = {};
    // use the singular to match RDFa attribute name
    let prefixArray = element
      .getAttribute("prefix")
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
        console.error("Parsing of attribute prefix failed!");
        console.error(`Can not parse ${prefixArray[i]}`);
      }
    }

    return sparqlPrefixes;
  }
  /**
   * Enable the play button when a query has finished executing
   * Can be called from the outside. Removes the loading spinner on the btn
   */
  enablePlayBtn() {
    this.sparnatural.enablePlayBtn();
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
