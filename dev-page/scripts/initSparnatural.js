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



	


sparnatural.addEventListener("init", (event) => {  
	sparnatural.configuration = {
	  headers: { "User-Agent" : "This is Sparnatural calling" },
	  autocomplete: {
	  	maxItems:40
	  }
	};
});

sparnatural.addEventListener("queryUpdated", (event) => {
  var queryString = sparnatural.expandSparql(event.detail.queryString);
  yasqe.setValue(queryString);
  // store JSON in hidden field
  document.getElementById('query-json').value = JSON.stringify(event.detail.queryJson);
});

sparnatural.addEventListener("submit", (event) => {
  sparnatural.disablePlayBtn();
  // trigger the query from YasQE
  yasqe.query();
});

document.getElementById('switch-language').onclick = function() {
  document.querySelector("spar-natural").setAttribute("lang", "en");
  sparnatural.display();
};


document.getElementById('export').onclick = function() {
  var jsonString = JSON.stringify(
      JSON.parse(document.getElementById('query-json').value),
      null,
      2
    );
  $('#export-json').val(jsonString);
  $('#exportModal').modal('show');       
}

document.getElementById('load').onclick = function() {
  $('#loadModal').modal('show');       
}

document.getElementById('loadJson').onclick = function() {
  sparnatural.loadQuery(JSON.parse(document.getElementById('load-json').value));   
  $('#loadModal').modal('hide'); 
}


document.getElementById('clear').onclick = function() {
  sparnatural.clear();
}
