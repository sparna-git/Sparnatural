$( document ).ready(function($) {
  // Handler for .ready() called.
  

  
    // Parse a SPARQL query to a JSON object
//var SparqlParser = require('sparqljs').Parser;
var parser = new Nparser();
/*var parsedQuery = parser.parse(
'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
'SELECT ?this '+
'WHERE {'+
    '?this a <http://exemple.fr/ontology/Thing> .'+
    '?this <http://exemple.fr/ontology/created_by> ?actor .'+
    '?actor a <http://exemple.fr/ontology/Actor>'+
    'VALUES ?actor { <http://sparna.fr/database/person/123456> <http://sparna.fr/database/person/123457776> }'+
'}');*/
var parsedQuery = parser.parse(
'PREFIX rdf: <http://www.w3.org/2000/01/rdf-schema#>'+
'SELECT ?this '+
'WHERE {'+
    '?this rdf:type <http://exemple.fr/ontology/Thing> .'+
    '?this <http://exemple.fr/ontology/created_by> ?actor .'+
    '?actor rdf:type <http://exemple.fr/ontology/Actor> .'+
    '?actor <http://exemple.fr/ontology/from> ?place .'+
    '?place rdf:type <http://exemple.fr/ontology/Place> .'+
    'VALUES ?place {<http://sparna.fr/database/place/abcdef>}'+
'}');/*
var parsedQuery = parser.parse(
'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>'+
'SELECT ?this '+
'WHERE {'+
    '?this a <http://exemple.fr/ontology/Thing> .'+
    '?this <http://exemple.fr/ontology/created_by> ?time .'+
    'FILTER(?time > "1700-01-01"^^xsd:dateTime && ?time <= "1750-12-31"^^xsd:dateTime)'+
    '?this <http://exemple.fr/ontology/created_by> ?time2 .'+
    'FILTER(?time2 > "1700-01-01"^^xsd:dateTime && ?time2 <= "1750-12-31"^^xsd:dateTime)'+
'}');*/

// Regenerate a SPARQL query from a JSON object
//var SparqlGenerator = require('sparqljs').Generator;
var generator = new Ngenerator();
//parsedQuery.variables = ['?mickey'];
var generatedQuery = generator.stringify(parsedQuery);

console.log(parsedQuery);
$('#sparql code').html(generatedQuery) ;

var tmpData = parsedQuery;
 var formattedData = JSON.stringify(tmpData, null, '\t');
$('#json2 code').html(formattedData) ;
});
	
	
	
