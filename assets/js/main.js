$( document ).ready(function($) {
  // Handler for .ready() called.
  

  
  $('form').SimSemSearchForm() ;
  
 
  
    // Parse a SPARQL query to a JSON object
//var SparqlParser = require('sparqljs').Parser;
var parser = new Nparser();
var parsedQuery = parser.parse(
  'PREFIX foaf: <http://xmlns.com/foaf/0.1/> ' +
  'SELECT * { ?mickey foaf:name "Mickey Mouse"@en; foaf:knows ?other. }');

// Regenerate a SPARQL query from a JSON object
//var SparqlGenerator = require('sparqljs').Generator;
var generator = new Ngenerator();
parsedQuery.variables = ['?mickey'];
var generatedQuery = generator.stringify(parsedQuery);

console.log(parsedQuery);
$('#sparql code').html(generatedQuery) ;

var tmpData = parsedQuery;
 var formattedData = JSON.stringify(tmpData, null, '\t');
$('#json code').html(formattedData) ;
});
	
	
	
