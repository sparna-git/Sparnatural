import ISpecProvider from "../../sparnatural/spec-providers/ISpecProviders";
import ISettings from "./ISettings";
const settings: ISettings = {
  langSearch: null,
  currentTab: null, // needs to be set with a ref to the tab from Yasgui
  config: null,
  language: "en",
  maxDepth: 4, // max amount of where clauses
  addDistinct: true,
  noTypeCriteriaForObjects: ["http://dbpedia.org/ontology/Artwork"],
  backgroundBaseColor: "2,184,117",
  autocomplete: null,
  list: null,
  defaultEndpoint (){ if(this.language == 'fr'){return `http://fr.dbpedia.org/sparql`} else {return`http://dbpedia.org/sparql`} },
  sparqlPrefixes: {
    dbpedia: "http://dbpedia.org/ontology/",
  },
  localCacheDataTtl: 1000 * 60 * 60 * 24, // 24 hours in miiseconds
  filterConfigOnEndpoint: false,
  onQueryUpdated: function (
    queryString: string,
    queryJson: any,
    specProvider: ISpecProvider
  ) {
    queryString = semanticPostProcess(queryString, queryJson);
    queryString = specProvider.expandSparql(queryString);
    // set the query of the tab
    if (this.currentTab) {
      this.currentTab.setQuery(queryString);
    }
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
    elementCount: function (data) {
      return data.results.bindings[0].count.value;
    },
  },
  tooltipConfig: {
    delay: [800, 100],
    duration: [100, 100],
  },
  // triggered when "play" button is clicked
  onSubmit: function (form: any) {
    // enable loader on button
    form.sparnatural.enableLoading();
    // trigger the query from YasQE
    if (this.currentTab) {
      this.currentTab.getYasqe.query({
        url: this.defaultEnpoint,
        reqMethod: "POST", // or "GET"
        //headers: { Accept: "..." /*...*/ },
        //args: { arg1: "val1" /*...*/ },
        withCredentials: false,
      });
    }
  },
};

let semanticPostProcess = (queryString: any, queryJson?: any) => {
  $("#sparql code").html(
    queryString
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
  );
  return queryString;
};

export function getSettings() {
  return settings;
}

// merge given options with default setting values
export function mergeSettings(options: any) {
  $.extend(true, settings, settings, options);
}
