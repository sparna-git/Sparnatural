/*
  This file shows how to integrate SparNatural into your website. 
*/

const sparnatural = document.querySelector("spar-natural");

const queryString = window.location.search;
const urlParams = new URLSearchParams(queryString);
const lang = urlParams.get('lang')


console.log("init sparnatural...");
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

console.log("init yasr & yasqe...");
const yasqe = new Yasqe(document.getElementById("yasqe"), {
    requestConfig: { endpoint: $('#endpoint').text() },
    copyEndpointOnNewTab: false  
});


const yasr = new Yasr(document.getElementById("yasr"), {
    //this way, the URLs in the results are prettified using the defined prefixes in the query
    getUsedPrefixes : yasqe.getPrefixesFromQuery,
    "drawOutputSelector": false,
    "drawDownloadIcon": false,
    // avoid persistency side-effects
    "persistency": { "prefix": false, "results": { "key": false }}
});

// link yasqe and yasr
yasqe.on("queryResponse", function(_yasqe, response, duration) {
    yasr.setResponse(response, duration);
    sparnatural.enablePlayBtn() ;
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
