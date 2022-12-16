/*
  This file shows how to integrate SparNatural into your website. 
*/

export const sparnatural = document.querySelector("spar-natural");
import {renderDropDown} from './initDropDown.js'
import preLoadedQueries from '../configs/preloadqueries.js'
import {yasqe} from './initYasgui.js'


const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const lang = urlParams.get('lang')

sparnatural.addEventListener("queryUpdated", (event) => {
  var queryString = sparnatural.expandSparql(queryString);
  yasqe.setValue(queryString);
  // store JSON in hidden field
  document.getElementById('query-json').value = JSON.stringify(event.detail.queryJson);
});

sparnatural.addEventListener("submit", (event) => {
  console.log("onSubmit");
  sparnatural.disablePlayBtn();
  // trigger the query from YasQE
  yasqe.query();
});


document.getElementById('export').onclick = function() {
  var jsonString = JSON.stringify(
      JSON.parse(document.getElementById('query-json').value),
      null,
      2
    );
  $('#export-json').val(jsonString);
  $('#exportModal').modal('show');       
}