import { expandSparql } from "../ts-components/globals/globalfunctions";
export default {
    currentTab: null, // needs to be set with a ref to the tab from Yasgui
    config: {},
    // config: "sparnatural-config.ttl",
    language: "en",
    maxDepth: 4,
    addDistinct: true,
    noTypeCriteriaForObjects: ["http://dbpedia.org/ontology/Artwork"],
    sendQueryOnFirstClassSelected: true,
    backgroundBaseColor: "2,184,117",
    autocomplete: null,
    list: null,
    defaultEndpoint: "http://fr.dbpedia.org/sparql",
    sparqlPrefixes: {
      dbpedia: "http://dbpedia.org/ontology/",
    },
    localCacheDataTtl: 1000 * 60 * 60 * 24, // 24 hours in miiseconds
    filterConfigOnEndpoint: false,
    onQueryUpdated: function (queryString:string, queryJson:any, pivotJson:any) {
      queryString = semanticPostProcess(queryString, queryJson);
      // queryString = rdfsLabelPostProcess(queryString, queryJson);
      // queryString = isPrimaryTopicOfPostProcess(queryString, queryJson);
      // queryString = orderByPostProcess(queryString, queryJson);
      $("#sparql code").html(
        queryString
          .replace(/&/g, "&amp;")
          .replace(/</g, "&lt;")
          .replace(/>/g, "&gt;")
      );
      // set the query of the tab
      if(this.currentTab){
        this.currentTab.setQuery(queryString);
      }
    },
    tooltipConfig: {
      delay: [800, 100],
      duration: [100, 100],
    },
    // triggered when "play" button is clicked
    onSubmit: function (form:any) {
      // enable loader on button
      form.sparnatural.enableLoading();
      // trigger the query from YasQE
      if(this.currentTab){
        this.currentTab.getYasqe.query({
            url:this.defaultEnpoint,
            reqMethod: "POST", // or "GET"
            //headers: { Accept: "..." /*...*/ },
            //args: { arg1: "val1" /*...*/ },
            withCredentials: false,
          });
      }
    },
  };

  let prefixesPostProcess = function (queryString:any, queryJson:any) {
    if (queryString.indexOf("rdf-schema#") == -1) {
      queryString = queryString.replace(
        "SELECT ",
        "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \nSELECT "
      );
    }
    return queryString;
  };

  let isPrimaryTopicOfPostProcess = function (queryString:any, queryJson:any) {
    queryString = queryString.replace(
      new RegExp("\n\}"),
      "  ?this <http://xmlns.com/foaf/0.1/isPrimaryTopicOf> ?wikipedia \n}"
    );
    return queryString;
  };

  let rdfsLabelPostProcess = function (queryString:any, queryJson:any) {
    queryString = queryString.replace(
      new RegExp("\n\}"),
      "  ?this rdfs:label ?label FILTER(lang(?label) = 'fr') \n}"
    );
    return queryString;
  };

 let orderByPostProcess = function (queryString:any, queryJson:any) {
    queryString = queryString + "\nLIMIT 5000";
    queryString = queryString.replace(
      "SELECT DISTINCT ?this",
      "SELECT DISTINCT (STR(?label) AS ?nom) ?wikipedia ?this"
    );
    return queryString;
  };

  let semanticPostProcess = function (queryString:any, queryJson:any) {
    queryString = prefixesPostProcess(queryString, queryJson);
    queryString = expandSparql(queryString);
    return queryString;
  };