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

  var queryStringFromJson = sparnatural.expandSparql(event.detail.queryStringFromJson);



  yasqe.setValue(queryString);
  // store JSON in hidden field
  document.getElementById('query-json').value = JSON.stringify(event.detail.queryJson);

  // notify the query to yasr plugins
  for (const plugin in yasr.plugins) {
      if(yasr.plugins[plugin].notifyQuery) {
          yasr.plugins[plugin].notifyQuery(event.detail.queryJson);
      }
  }
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


Yasr.registerPlugin("TableX",SparnaturalYasguiPlugins.TableX);
Yasr.registerPlugin("Map",SparnaturalYasguiPlugins.MapPlugin);
delete Yasr.plugins['table'];
const yasr = new Yasr(document.getElementById("yasr"), {
    pluginOrder: ["TableX", "Response", "Map"],
    defaultPlugin: "TableX",
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
