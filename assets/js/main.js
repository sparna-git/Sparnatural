$( document ).ready(function($) {
  // Handler for .ready() called.
  
 $( "form" ).submit(function( event ) {
	 event.preventDefault();
				$('.CriteriaGroup').each(function() {
					
					var start = $('.StartClassGroup select').val() ;
					var obj = $('.ObjectPropertyGroup select').val() ;
					var end = $('.EndClassGroup select').val() ;
					var endValueName = '?end1' ;
					var json = newQueryJson() ;
					
					json = addTriple(json, '?this', "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", start) ;
					json = addTriple(json, '?this', obj, endValueName) ;
					json = addTriple(json, endValueName, "http://www.w3.org/1999/02/22-rdf-syntax-ns#type", end) ;
					if ($('.EndClassWidgetGroup>div').hasClass('ListeWidget')) {
						json = addVariable(json, endValueName, $('.EndClassWidgetGroup #listwidget').val() ) ;
					} else {
						json = addVariable(json, endValueName, $('.EndClassWidgetGroup #basics-value').val() ) ;
					}
					
					
					console.log(json) ;
					
					//var SparqlGenerator = require('sparqljs').Generator;
					var generator = new Ngenerator();
					//parsedQuery.variables = ['?mickey'];
					var generatedQuery = generator.stringify(json);
					
					
					console.log(generatedQuery) ;
					
					
					$('#sparql code').html(generatedQuery.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;"));
					var jsons = JSON.stringify(json, null, '\t');
					$('#json code').html(jsons) ;
					
					
				}) ;
				
				return false ;
				//
});

function newQueryJson() {
	
	return {
		"queryType": "SELECT",
		"variables": [
			"?this"
		],
		"where": [{
			"type": "bgp",
			"triples": []
		},
		{
			"type": "values",
			"values": []
		}],
		"type": "query",
		"prefixes": {
			"rdfs": "http://www.w3.org/2000/01/rdf-schema#"
		}
	}
	
	
	
}

function addTriple(json, subjet, predicate, object) {
	
	var triple = {
					"subject": subjet,
					"predicate": predicate,
					"object": object,
				} ;
				
			json.where[0].triples.push(triple) ;
	
	return json ;
}

function addVariable(json, name, valueUrl) {
	
	var newValue = {
					[name]: valueUrl
				}
		json.where[1].values.push(newValue) ;		
	
	return json ;	
}
  
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
'PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>'+
'PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>'+
'SELECT ?this '+
'WHERE {'+
    '?this a <http://exemple.fr/ontology/Thing> .'+
    '?this <http://exemple.fr/ontology/created_by> ?time .'+
    'FILTER(?time > "1700-01-01"^^xsd:dateTime && ?time <= "1750-12-31"^^xsd:dateTime)'+
    '?this <http://exemple.fr/ontology/created_by> ?time2 .'+
    'FILTER(?time2 > "1700-01-01"^^xsd:dateTime && ?time2 <= "1750-12-31"^^xsd:dateTime)'+
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
$('#json2 code').html(formattedData) ;
});
	
	
	
