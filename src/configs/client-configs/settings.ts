import ISpecProvider from "../../sparnatural/spec-providers/ISpecProviders";
import ISettings from "./ISettings";

const settings: ISettings = {
  langSearch: null,
  config: null,
  language: "en",
  maxDepth: 4, // max amount of where clauses
  addDistinct: true,
  backgroundBaseColor: "2,184,117",
  defaultEndpoint (){ if(this.language == 'fr'){return `http://fr.dbpedia.org/sparql`} else {return`http://dbpedia.org/sparql`} },
  sparqlPrefixes: {},
  localCacheDataTtl: 1000 * 60 * 60 * 24, // 24 hours in miiseconds
  filterConfigOnEndpoint: false,
  
  autocomplete : {
    /**
     * This must return the URL that will be called when the user starts
     * typing a few letter in a search field.
     *
     * @param {string} domain - The domain of the criteria currently being edited, i.e. type of the triple subjects.
     * @param {string} property - The predicate of the criteria currently being edited
     * @param {string} range - The range of the criteria currently being edited, i.e. type of the triple objects. This is the class of the entities being searched for.
     * @param {string} key - The letters that the user has typed in the search field.
     **/
    autocompleteUrl : function(domain: any, property: any, range: any, key: any) {
      console.log("Please specify function for autocompleteUrl option in in init parameters of Sparnatural : function(domain, property, range, key)") ;
    },

    /**
        * Returns the path in the returned JSON structure where the list of entries should be read.
        * This is typically the data structure itself, but can correspond to a subentry inside.
        *
     * @param {string} domain - The domain of the criteria currently being edited
     * @param {string} property - The predicate of the criteria currently being edited
     * @param {string} range - The range of the criteria currently being edited
     * @param {object} data - The data structure returned from an autocomplete call
        **/
    listLocation: function(domain: any, property: any, range: any, data: any) {
      return data;
    },

    /**
        * Returns the label to display for a single autocomplete result; defaults to `element.label`.
        *
        * @param {object} element - A single autocomplete result
        **/
    elementLabel: function(element: any) {
      return element.label;
    },

    /**
     * Returns the URI to of a single autocomplete result; ; defaults to `element.uri`.
     *
     * @param {object} element - A single autocomplete result
     **/
    elementUri: function(element: any) {
      return element.uri;
    },

    /**
     * Whether the Easyautocomplete 'enableMatch' flag should be set; this should
     * be useful only when loading the autocomplete results from a local file, leave to
     * false otherwise.
     **/
    enableMatch: function(domain: any, property: any, range: any) {
      return false;
    },
  },			
  list : {

    /**
     * This must return the URL that will be called to list the values to populate the dropdown.
     *
     * @param {string} domain - The domain of the criteria currently being edited, i.e. type of the triple subjects.
     * @param {string} property - The predicate of the criteria currently being edited
     * @param {string} range - The range of the criteria currently being edited, i.e. type of the triple objects. This is the class of the entities being searched for.
     **/
    listUrl : function(domain: any, property: any, range: any) {
      console.log("Please specify function for listUrl option in in init parameters of Sparnatural : function(domain, property, range)" ) ;
    },

    /**
        * Returns the path in the returned JSON structure where the list of entries should be read.
        * This is typically the data structure itself, but can correspond to a subentry inside.
        *
     * @param {string} domain - The domain of the criteria currently being edited
     * @param {string} property - The predicate of the criteria currently being edited
     * @param {string} range - The range of the criteria currently being edited
     * @param {object} data - The data structure returned from a list call
        **/
    listLocation: function(domain: any, property: any, range: any, data: any) {
      return data;
    },

    /**
        * Returns the label to display for a single list entry; defaults to `element.label`.
        *
        * @param {object} element - A single list entry
        **/
    elementLabel: function(element: any) {
      return element.label;
    },

    /**
        * Returns the URI for a single list entry; defaults to `element.uri`.
        *
        * @param {object} element - A single list entry
        **/
    elementUri: function(element: any) {
      return element.uri;
    }
  },
  
  onQueryUpdated: function (
    queryString: string,
    queryJson: any,
    specProvider: ISpecProvider
  ) {
    console.log("Veuillez préciser le nom de la fonction pour l'option onQueryUpdated dans les parametre d'initalisation de Sparnatural. Les parêtres envoyés à la fonction contiendront la requête convertie en Sparql et le Json servant à générer la requête" ) ;
  },
  
  dates: {
    datesUrl: function (domain: any, property: any, range: any, key: any) {
      console.log(
        "Please specify function for datesUrl option in in init parameters of Sparnatural : function(domain, property, range, key)"
      );
    },
    listLocation: function (domain: any, property: any, range: any, data: any) {
      return data;
    },
    elementLabel: function (element: any) {
      return element.label + " " + element.synonyms.join(" ");
    },
    elementStart: function (element: any) {
      return element.start.year;
    },
    elementEnd: function (element: any) {
      return element.stop.year;
    },
  },
  statistics: {
    countClassUrl: function (aClass: any) {
      console.log(
        "Please specify function to count number of instances of each class : function(aClass)"
      );
    },
    countPropertyUrl: function (domain: any, property: any, range: any) {
      console.log(
        "Please specify function to count number of instances of each property : function(domain, property, range)"
      );
    },
    countPropertyWithoutRangeUrl: function (domain: any, property: any) {
      console.log(
        "Please specify function to count number of instances of each property without a range : function(domain, property)"
      );
    },
    elementCount: function (data: any) {
      return data.results.bindings[0].count.value;
    },
  },
  tooltipConfig: {
    delay: [800, 100],
    duration: [100, 100],
  },
  // triggered when "play" button is clicked
  onSubmit: null,
};

export function getSettings() {
  return settings;
}

// merge given options with default setting values
export function mergeSettings(options: any) {
  $.extend(true, settings, settings, options);
}
