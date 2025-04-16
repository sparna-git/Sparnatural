//
// Place any custom JS here
//

// reference to the sparnatural webcomponent
const sparnatural = document.querySelector("spar-natural");

// display on the page the endpoint URL with which sparnatural is configured
document.querySelector("#displayEndpoint").setAttribute("href", sparnatural.getAttribute("endpoint"));
document.querySelector("#displayEndpoint").textContent = sparnatural.getAttribute("endpoint");

// init yasQE query editor
const yasqe = new Yasqe(document.getElementById("yasqe"), {
	requestConfig: {
	  // make sure the endpoint is the same as sparnatural
	  endpoint: sparnatural.getAttribute("endpoint"),
	  method: "GET",
	  header: {}
	},
	copyEndpointOnNewTab: false  
});

// init yasR result display
// register a specific plugin that is capable of displaying clikable label + URI
Yasr.registerPlugin("TableX",SparnaturalYasguiPlugins.TableX);
delete Yasr.plugins['table'];

const yasr = new Yasr(document.getElementById("yasr"), {
	pluginOrder: ["TableX", "response"],
	defaultPlugin: "TableX"
});

// link yasqe and yasr
yasqe.on("queryResponse", function(_yasqe, response, duration) {
	yasr.setResponse(response, duration);
	// when response is received, enable the button
	sparnatural.enablePlayBtn();
});

// listener when sparnatural updates the query
// see http://docs.sparnatural.eu/Javascript-integration.html#sparnatural-events
sparnatural.addEventListener("queryUpdated", (event) => {
	// get the SPARQL query string, and pass it to yasQE
	queryString = sparnatural.expandSparql(event.detail.queryString);
	yasqe.setValue(queryString);
	// display the JSON query on the console
	console.log("Sparnatural JSON query structure:");
	console.dir(event.detail.queryJson);
});

// listener when the sparnatural submit button is clicked
// see http://docs.sparnatural.eu/Javascript-integration.html#sparnatural-events
sparnatural.addEventListener("submit", (event) => {
	// enable loader on button
	sparnatural.disablePlayBtn() ; 
	// trigger the query from YasQE
	yasqe.query();
});

// listener when the sparnatural reset button is clicked
// see http://docs.sparnatural.eu/Javascript-integration.html#sparnatural-events
sparnatural.addEventListener("reset", (event) => {
	// empties the SPARQL query on yasQE
	yasqe.setValue("");
});

// hide/show yasQE
document.getElementById('sparql-toggle').onclick = function() {
	if(document.getElementById('yasqe').style.display == 'none') {
	  document.getElementById('yasqe').style.display = 'block';
	  yasqe.setValue(yasqe.getValue());
	  yasqe.refresh();
	} else {
	  document.getElementById('yasqe').style.display = 'none';
	}
	return false;        
} ;
