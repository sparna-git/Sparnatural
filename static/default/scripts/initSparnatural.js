/*
  This file shows how to integrate SparNatural into your website. 
*/

export const sparnatural = document.querySelector("spar-natural");
import config from '../configs/config.js';
import {renderDropDown} from './initDropDown.js'
import preLoadedQueries from '../configs/preloadqueries.js'
import {yasqe} from './initYasgui.js'


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const lang = urlParams.get('lang')

let prefixesPostProcess = function(queryString, queryJson) {
  if(queryString.indexOf("rdf-schema#") == -1) {
    queryString = queryString.replace("SELECT ", "PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> \nSELECT ");
  }         
  return queryString;
}

let isPrimaryTopicOfPostProcess = function(queryString, queryJson) {
  queryString = queryString.replace(new RegExp('\n\}'), "  ?this <http://xmlns.com/foaf/0.1/isPrimaryTopicOf> ?wikipedia \n}");
  return queryString;
}

let semanticPostProcess = function(queryString, queryJson) {
  queryString = prefixesPostProcess(queryString, queryJson);
  return queryString;
} 


// If you would like to overwride default settings
const settings = {
  config: config,
  language: "fr",
  defaultEndpoint: function() { return $('#endpoint').text() },
  //language:lang,
  onQueryUpdated: function(queryString, queryJson, specProvider) {
      queryString = semanticPostProcess(queryString, queryJson);
      queryString = specProvider.expandSparql(queryString);
      yasqe.setValue(queryString);
      },
  // triggered when "play" button is clicked
  onSubmit: ()=> {
      sparnatural.disablePlayBtn();
      // trigger the query from YasQE
      yasqe.query();

  },
}



sparnatural.addEventListener('componentLoaded',(e)=>{
  sparnatural.settings = settings
  // set the queries to the dropdown
  const dropDown = document.querySelector("custom-dropdown")
  renderDropDown(dropDown,sparnatural.parseQueries(preLoadedQueries))
  dropDown.addEventListener('loadQuery',(e)=>{
    sparnatural.loadQuery(e.detail.query)
  })
})