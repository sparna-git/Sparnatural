$( document ).ready(function($) {
  // Handler for .ready() called.
  

  
  $('form').SimSemSearchForm() ;
  
 $( "form" ).submit(function( event ) {
				$('select').each(function() {
					
					
					
				}) ;
  event.preventDefault();
});
  
    // Parse a SPARQL query to a JSON object
//var SparqlParser = require('sparqljs').Parser;
var parser = new Nparser();
var parsedQuery = parser.parse(
'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
'SELECT ?this '+
'WHERE {'+
    '?this a <http://exemple.fr/ontology/Thing> .'+
    '?this <http://exemple.fr/ontology/created_by> ?actor .'+
    '?actor a <http://exemple.fr/ontology/Actor>'+
    'VALUES ?actor { <http://sparna.fr/database/person/123456> <http://sparna.fr/database/person/123457776> }'+
'}');

// Regenerate a SPARQL query from a JSON object
//var SparqlGenerator = require('sparqljs').Generator;
var generator = new Ngenerator();
//parsedQuery.variables = ['?mickey'];
var generatedQuery = generator.stringify(parsedQuery);

console.log(parsedQuery);
$('#sparql code').html(generatedQuery) ;

var tmpData = parsedQuery;
 var formattedData = JSON.stringify(tmpData, null, '\t');
$('#json code').html(formattedData) ;
});
	
	
	
