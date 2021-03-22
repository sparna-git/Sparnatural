var SPARNATURAL_CONFIG_DATASOURCES	=		"http://data.sparna.fr/ontologies/sparnatural-config-datasources#";

var QUERY_STRINGS_BY_QUERY_TEMPLATE = new Map();

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_literal_list_alpha", 
`
SELECT DISTINCT ?value (STR(?value) AS ?label)
WHERE {
    ?domain a $domain .
    ?domain $property ?value .
}
ORDER BY ?label
`
);


QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_list_URI_alpha", 
`
SELECT DISTINCT ?uri (STR(?uri) AS ?label)
WHERE {
    ?domain a $domain .
    ?domain $property ?uri .
}
ORDER BY ?label
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_list_URI_count", 
`
SELECT ?uri ?count (CONCAT(STR(?uri), ' (', STR(?count), ')') AS ?label)
WHERE {
{
  SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
  WHERE {
    ?domain a $domain .
    ?domain $property ?uri .
  }
  GROUP BY ?uri
}
}
ORDER BY DESC(?count)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_alpha", 
`
SELECT DISTINCT ?uri ?label
WHERE {
    ?domain a $domain .
    ?domain $property ?uri .
    ?uri $labelPath ?label .
    FILTER(lang(?label) = "" || lang(?label) = $lang)
}
ORDER BY ?label
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_count", 
`
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label)
WHERE {
{
  SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
  WHERE {
    ?domain a $domain .
    ?domain $property ?uri .
  }
  GROUP BY ?uri
}
?uri $labelPath ?theLabel .
FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
}
ORDER BY DESC(?count)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_strstarts", 
`
SELECT DISTINCT ?uri ?label
WHERE {
  ?domain a $domain .
  ?domain $property ?uri .
  ?uri a $range .
  ?uri $labelPath ?label 
  FILTER(lang(?label) = '' || lang(?label) = $lang)
  FILTER(STRSTARTS(LCASE(STR(?label)), LCASE("$key"))) 
} 
ORDER BY ?label
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_bifcontains", 
`
SELECT DISTINCT ?uri ?label
 WHERE {
  ?domain a $domain .
  ?domain $property ?uri .
  ?uri a $range .
  ?uri $labelPath ?label .
  FILTER(lang(?label) = '' || lang(?label) = $lang )
  ?label bif:contains "'$key'" . 
} 
ORDER BY ?label
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
SPARNATURAL_CONFIG_DATASOURCES+"query_search_URI_contains", 
`
SELECT DISTINCT ?uri ?label
WHERE {
  ?domain a $domain .
  ?domain $property ?uri .
  ?uri a $range .
  BIND(STR(?uri) AS ?label)
  FILTER(CONTAINS(LCASE(?label), LCASE("$key"))) 
} 
ORDER BY ?label
`
);


var DATASOURCES_CONFIG = new Map();

DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"literal_list_alpha", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_literal_list_alpha")
});

DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_URI_alpha", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_URI_alpha"),
	labelProperty : null
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_URI_count", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_URI_count"),
	labelProperty : null
});

DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_rdfslabel_alpha", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_alpha"),
	labelProperty : "http://www.w3.org/2000/01/rdf-schema#label"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_rdfslabel_count", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_count"),
	labelProperty : "http://www.w3.org/2000/01/rdf-schema#label"
});

DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_skospreflabel_alpha", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_alpha"),
	labelProperty : "http://www.w3.org/2004/02/skos/core#prefLabel"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_skospreflabel_count", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_count"),
	labelProperty : "http://www.w3.org/2004/02/skos/core#prefLabel"
});

DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_dctermstitle_alpha", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_alpha"),
	labelProperty : "http://purl.org/dc/terms/title"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_dctermstitle_count", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_count"),
	labelProperty : "http://purl.org/dc/terms/title"
});

DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_foafname_alpha", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_alpha"),
	labelProperty : "http://xmlns.com/foaf/0.1/name"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_foafname_count", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_count"),
	labelProperty : "http://xmlns.com/foaf/0.1/name"
});

DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_schemaname_alpha", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_alpha"),
	labelProperty : "http://schema.org/name"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"list_schemaname_count", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_list_label_count"),
	labelProperty : "http://schema.org/name"
});


DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"search_rdfslabel_strstarts", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_strstarts"),
	labelProperty : "http://www.w3.org/2000/01/rdf-schema#label"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"search_foafname_strstarts", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_strstarts"),
	labelProperty : "http://xmlns.com/foaf/0.1/name"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"search_skospreflabel_strstarts", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_strstarts"),
	labelProperty : "http://www.w3.org/2004/02/skos/core#prefLabel"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"search_dctermstitle_strstarts", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_strstarts"),
	labelProperty : "http://purl.org/dc/terms/title"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"search_schemaname_strstarts", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_strstarts"),
	labelProperty : "http://schema.org/name"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"search_rdfslabel_bifcontains", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_search_label_bifcontains"),
	labelProperty : "http://www.w3.org/2000/01/rdf-schema#label"
});
DATASOURCES_CONFIG.set(
SPARNATURAL_CONFIG_DATASOURCES+"search_URI_contains", {
	queryTemplate : QUERY_STRINGS_BY_QUERY_TEMPLATE.get(SPARNATURAL_CONFIG_DATASOURCES+"query_search_URI_contains")
});


module.exports = Object.freeze({
    SPARNATURAL_CONFIG_DATASOURCES	: 		SPARNATURAL_CONFIG_DATASOURCES,

    // annotation and data properties
	DATASOURCE 			 			: 		SPARNATURAL_CONFIG_DATASOURCES+'datasource',
	LABEL_PATH 			 			: 		SPARNATURAL_CONFIG_DATASOURCES+'labelPath',
	LABEL_PROPERTY 			 		: 		SPARNATURAL_CONFIG_DATASOURCES+'labelProperty',
	QUERY_STRING 			 		: 		SPARNATURAL_CONFIG_DATASOURCES+'queryString',
	SPARQL_ENDPOINT_URL	 			: 		SPARNATURAL_CONFIG_DATASOURCES+'sparqlEndpointUrl',

	// object properties
	QUERY_TEMPLATE		 			: 		SPARNATURAL_CONFIG_DATASOURCES+'queryTemplate',

    // individuals
	QUERY_LIST_URI_ALPHA 			: 		SPARNATURAL_CONFIG_DATASOURCES+'query_list_URI_alpha',
	QUERY_LIST_URI_COUNT 			: 		SPARNATURAL_CONFIG_DATASOURCES+'query_list_URI_count',
	QUERY_LIST_LABEL_ALPHA 			: 		SPARNATURAL_CONFIG_DATASOURCES+'query_list_label_alpha',
	QUERY_LIST_LABEL_COUNT 			: 		SPARNATURAL_CONFIG_DATASOURCES+'query_list_label_count',
	QUERY_SEARCH_LABEL_STRSTARTS	: 		SPARNATURAL_CONFIG_DATASOURCES+'query_search_label_starstarts',
	QUERY_SEARCH_LABEL_BITCONTAINS	: 		SPARNATURAL_CONFIG_DATASOURCES+'query_search_label_bitcontains',
	QUERY_SEARCH_URI_CONTAINS		: 		SPARNATURAL_CONFIG_DATASOURCES+'query_search_URI_contains',

	LITERAL_LIST_ALPHA 		 		: 		SPARNATURAL_CONFIG_DATASOURCES+'literal_list_alpha',
	
	LIST_URI_ALPHA 		 			: 		SPARNATURAL_CONFIG_DATASOURCES+'list_URI_alpha',
	LIST_URI_COUNT 		 			: 		SPARNATURAL_CONFIG_DATASOURCES+'list_URI_count',
	LIST_RDFSLABEL_ALPHA 		 	: 		SPARNATURAL_CONFIG_DATASOURCES+'list_rdfslabel_alpha',
	LIST_RDFSLABEL_COUNT 		 	: 		SPARNATURAL_CONFIG_DATASOURCES+'list_rdfslabel_count',
	LIST_SKOSPREFLABEL_ALPHA 		: 		SPARNATURAL_CONFIG_DATASOURCES+'list_skospreflabel_alpha',
	LIST_SKOSPREFLABEL_COUNT 		: 		SPARNATURAL_CONFIG_DATASOURCES+'list_skospreflabel_count',
	LIST_FOAFNAME_ALPHA 		 	: 		SPARNATURAL_CONFIG_DATASOURCES+'list_foafname_alpha',
	LIST_FOAFNAME_COUNT 		 	: 		SPARNATURAL_CONFIG_DATASOURCES+'list_foafname_count',
	LIST_DCTERMSTITLE_ALPHA 		: 		SPARNATURAL_CONFIG_DATASOURCES+'list_dctermstitle_alpha',
	LIST_DCTERMSTITLE_COUNT 		: 		SPARNATURAL_CONFIG_DATASOURCES+'list_dctermstitle_count',

	SEARCH_RDFSLABEL_STRSTARTS 		: 		SPARNATURAL_CONFIG_DATASOURCES+'search_rdfslabel_strstarts',
	SEARCH_FOAFNAME_STRSTARTS 		: 		SPARNATURAL_CONFIG_DATASOURCES+'search_foafname_strstarts',
	SEARCH_SKOSPREFLABEL_STRSTARTS 	: 		SPARNATURAL_CONFIG_DATASOURCES+'search_skospreflabel_strstarts',
	SEARCH_DCTERMSTITLE_STRSTARTS 	: 		SPARNATURAL_CONFIG_DATASOURCES+'search_dctermstitle_strstarts',
	SEARCH_URI_CONTAINS			 	: 		SPARNATURAL_CONFIG_DATASOURCES+'search_URI_contains',
	SEARCH_RDFSLABEL_BIFCONTAINS 	: 		SPARNATURAL_CONFIG_DATASOURCES+'search_rdfslabel_bifcontains',

	QUERY_STRINGS_BY_QUERY_TEMPLATE	: 		QUERY_STRINGS_BY_QUERY_TEMPLATE,
	DATASOURCES_CONFIG				: 		DATASOURCES_CONFIG
});