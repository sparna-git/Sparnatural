import { expandSparql } from "./globalfunctions";
import ISettings from "./ISettings";
const settings:ISettings = {
    langSearch:null,
    currentTab: null, // needs to be set with a ref to the tab from Yasgui
    config: null,
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
    dates : {
      datesUrl : function(domain:any, property:any, range:any, key:any) {
        console.log("Please specify function for datesUrl option in in init parameters of Sparnatural : function(domain, property, range, key)") ;
      },
      listLocation: function(domain:any, property:any, range:any, data:any) {
        return data;
      },
      elementLabel: function(element:any) {
        return element.label+' '+element.synonyms.join(' ');
      },
      elementStart: function(element:any) {
        return element.start.year;
      },
      elementEnd: function(element:any) {
        return element.stop.year;
      }				
    },
    statistics : {
      countClassUrl : function(aClass:any) {
        console.log("Please specify function to count number of instances of each class : function(aClass)") ;
      },
      countPropertyUrl : function(domain:any, property:any, range:any) {
        console.log("Please specify function to count number of instances of each property : function(domain, property, range)") ;
      },
      countPropertyWithoutRangeUrl : function(domain:any, property:any) {
        console.log("Please specify function to count number of instances of each property without a range : function(domain, property)") ;
      },
      elementCount: function(data) {
        return data.results.bindings[0].count.value;
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
  }

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

  
export function getSettings(){
    return settings
}

// merge given options with default setting values
export function mergeSettings(options:any){
    console.log("merging into settings")
    console.dir(options)
    $.extend(true, settings, settings, options);
}
