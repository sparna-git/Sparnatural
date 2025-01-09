var SPARNATURAL_CONFIG_DATASOURCES =
  "http://data.sparna.fr/ontologies/sparnatural-config-datasources#";

var QUERY_STRINGS_BY_QUERY_TEMPLATE = new Map();

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_literal_list_alpha",
  `
SELECT DISTINCT ?value (STR(?value) AS ?label)
WHERE {
    ?domain $type $domain .
    ?domain $property ?value .
}
ORDER BY UCASE(?label)
LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_literal_list_count",
  `
SELECT ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) (STR(?theLabel) as ?itemLabel)
WHERE {
  {
  SELECT DISTINCT ?count ?theLabel
  WHERE {
  {
    SELECT DISTINCT ?theLabel (COUNT(?theLabel) AS ?count)
    WHERE {
      ?domain $type $domain .
      ?domain $property ?theLabel .
      FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
    }
    GROUP BY ?theLabel
  }
  }
  ORDER BY DESC(?count) UCASE(?theLabel)
  LIMIT 500
  }
}
ORDER BY DESC(?count) UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_literal_list_alpha_with_count",
  `
SELECT ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) (STR(?theLabel) as ?itemLabel)
WHERE {
  {
  SELECT DISTINCT ?count ?theLabel
  WHERE {
  {
    SELECT DISTINCT ?theLabel (COUNT(?theLabel) AS ?count)
    WHERE {
      ?domain $type $domain .
      ?domain $property ?theLabel .
      FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
    }
    GROUP BY ?theLabel
  }
  }
  ORDER BY UCASE(?theLabel)
  LIMIT 500
  }
}
ORDER BY UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_alpha",
  `
SELECT DISTINCT ?uri (STR(?uri) AS ?label)
WHERE {
    ?domain $type $domain .
    ?domain $property ?uri .
    FILTER(isIRI(?uri))
}
ORDER BY UCASE(?label)
LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_count",
  `
SELECT ?uri ?count (CONCAT(STR(?uri), ' (', STR(?count), ')') AS ?label) (STR(?uri) as ?itemLabel)
WHERE {
{
  SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
  WHERE {
    ?domain $type $domain .
    ?domain $property ?uri .
    FILTER(isIRI(?uri))
  }
  GROUP BY ?uri
}
}
ORDER BY DESC(?count)
LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_alpha",
  `
  SELECT DISTINCT ?value (CONCAT(IF(isLiteral(?value) && LANG(?value) != '' && LANG(?value) != $lang,CONCAT(STR(?value), " <sup>(",LANG(?value),")</sup>"),STR(?value))) AS ?label)
  WHERE {
      ?domain $type $domain .
      {
        {
          ?domain $property ?value . FILTER(isIRI(?value))
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = $lang))
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = $defaultLang))
          FILTER NOT EXISTS {
            ?domain $property ?valuePrefLang .
            FILTER(LANG(?valuePrefLang) = $lang)
          }
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = ""))
          FILTER NOT EXISTS {
            ?domain $property ?valueAnyLang .
            FILTER((LANG(?valueAnyLang) = $lang) || (LANG(?valueAnyLang) = $defaultLang))
          }
        }
      }
      # Note how the range criteria is not used in this query
  }
  ORDER BY UCASE(?label)
  LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_alpha_with_count",
  `
  SELECT DISTINCT ?value ?count (CONCAT(IF(isLiteral(?value) && LANG(?value) != '' && LANG(?value) != $lang,CONCAT(STR(?value), " <sup>(",LANG(?value),")</sup>"),STR(?value)), ' (', STR(?count), ')') AS ?label) (STR(?value) as ?itemLabel)
  WHERE {
  {
    SELECT DISTINCT ?value (COUNT(DISTINCT ?domain) AS ?count)
    WHERE {
      ?domain $type $domain .
      {
        {
          ?domain $property ?value . FILTER(isIRI(?value))
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = $lang))
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = $defaultLang))
          FILTER NOT EXISTS {
            ?domain $property ?valuePrefLang .
            FILTER(LANG(?valuePrefLang) = $lang)
          }
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = ""))
          FILTER NOT EXISTS {
            ?domain $property ?valueAnyLang .
            FILTER((LANG(?valueAnyLang) = $lang) || (LANG(?valueAnyLang) = $defaultLang))
          }
        }
      }
    }
    GROUP BY ?value
  }
  }
  ORDER BY UCASE(?label)
  LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_count",
  `
  SELECT ?value ?count (CONCAT(IF(isLiteral(?value) && LANG(?value) != '' && LANG(?value) != $lang,CONCAT(STR(?value), " <sup>(",LANG(?value),")</sup>"),STR(?value)), ' (', STR(?count), ')') AS ?label) (STR(?value) as ?itemLabel)
  WHERE {
  {
    SELECT DISTINCT ?value (COUNT(DISTINCT ?domain) AS ?count)
    WHERE {
      ?domain $type $domain .
      {
        {
          ?domain $property ?value . FILTER(isIRI(?value))
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = $lang))
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = $defaultLang))
          FILTER NOT EXISTS {
            ?domain $property ?valuePrefLang .
            FILTER(LANG(?valuePrefLang) = $lang)
          }
        }
        UNION
        {
          ?domain $property ?value . 
          FILTER(isLiteral(?value) && (lang(?value) = ""))
          FILTER NOT EXISTS {
            ?domain $property ?valueAnyLang .
            FILTER((LANG(?valueAnyLang) = $lang) || (LANG(?valueAnyLang) = $defaultLang))
          }
        }
      }
    }
    GROUP BY ?value
  }
  }
  ORDER BY DESC(?count) UCASE(?label)
  LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha",
  `
SELECT DISTINCT ?uri ?label
WHERE {
    ?domain $type $domain .
    ?domain $property ?uri .
    ?uri $labelPath ?label .
    FILTER(lang(?label) = "" || lang(?label) = $lang)
    FILTER(isIRI(?uri))
}
ORDER BY UCASE(?label)
LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_count",
  `
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) (STR(?theLabel) AS ?itemLabel)
WHERE {
  {
  SELECT ?uri ?count ?theLabel
  WHERE {
  {
    SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
    WHERE {
      ?domain $type $domain .
      ?domain $property ?uri .
      FILTER(isIRI(?uri))
    }
    GROUP BY ?uri
  }
  ?uri $labelPath ?theLabel .
  FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
  }
  ORDER BY DESC(?count) UCASE(?theLabel)
  LIMIT 500
  }
}
ORDER BY DESC(?count) UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha_with_count",
  `
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label)  (STR(?theLabel) AS ?itemLabel)
WHERE {
  {
  SELECT ?uri ?count ?theLabel
  WHERE {
  {
    SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
    WHERE {
      ?domain $type $domain .
      ?domain $property ?uri .
      FILTER(isIRI(?uri))
    }
    GROUP BY ?uri
  }
  ?uri $labelPath ?theLabel .
  FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
  }
  ORDER BY UCASE(?theLabel)
  LIMIT 500
  }
}
ORDER BY UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_with_range_alpha",
  `
SELECT DISTINCT ?uri ?label
WHERE {
    ?domain $type $domain .
    ?domain $property ?uri .
    ?uri $type $range .
    ?uri $labelPath ?label .
    FILTER(isIRI(?uri))
    FILTER(lang(?label) = "" || lang(?label) = $lang)
}
ORDER BY UCASE(?label)
LIMIT 500
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_with_range_count",
  `
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label)  (STR(?theLabel) AS ?itemLabel)
WHERE {
  {
  SELECT ?uri ?count ?theLabel
  WHERE {
  {
    SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
    WHERE {
      ?domain $type $domain .
      ?domain $property ?uri .
      FILTER(isIRI(?uri))
      ?uri $type $range .
    }
    GROUP BY ?uri
  }
  ?uri $labelPath ?theLabel .
  FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
  }
  ORDER BY DESC(?count) UCASE(?theLabel)
  LIMIT 500
  }
}
ORDER BY DESC(?count) UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES +
    "query_list_label_with_range_alpha_with_count",
  `
SELECT ?uri ?count (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label)  (STR(?theLabel) AS ?itemLabel)
WHERE {
  {
  SELECT ?uri ?count ?theLabel
  WHERE {
  {
    SELECT DISTINCT ?uri (COUNT(?domain) AS ?count)
    WHERE {
      ?domain $type $domain .
      ?domain $property ?uri .
      FILTER(isIRI(?uri))
      # range criteria
      ?uri $type $range .
    }
    GROUP BY ?uri
  }
  ?uri $labelPath ?theLabel .
  FILTER(lang(?theLabel) = "" || lang(?theLabel) = $lang)
  }
  ORDER BY UCASE(?theLabel)
  LIMIT 500
  }
}
ORDER BY UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_strstarts",
  `
SELECT DISTINCT ?uri ?label
WHERE {
  ?domain $type $domain .
  ?domain $property ?uri .
  ?uri $type $range .
  ?uri $labelPath ?label .
  FILTER(isIRI(?uri))
  FILTER(lang(?label) = '' || lang(?label) = $lang)
  FILTER(STRSTARTS(LCASE(STR(?label)), LCASE("$key"))) 
} 
ORDER BY UCASE(?label)
LIMIT 15
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_contains",
  `
SELECT DISTINCT ?uri ?label
WHERE {
  ?domain $type $domain .
  ?domain $property ?uri .
  ?uri $type $range .
  ?uri $labelPath ?label .
  FILTER(isIRI(?uri))
  FILTER(lang(?label) = '' || lang(?label) = $lang)
  FILTER(CONTAINS(LCASE(STR(?label)), LCASE("$key"))) 
} 
ORDER BY UCASE(?label)
LIMIT 15
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_bifcontains",
  `
PREFIX bif: <http://www.openlinksw.com/schemas/bif#>
SELECT DISTINCT ?uri ?label
 WHERE {
  ?domain $type $domain .
  ?domain $property ?uri .
  ?uri $type $range .
  ?uri $labelPath ?label .
  FILTER(isIRI(?uri))
  FILTER(lang(?label) = '' || lang(?label) = $lang )
  ?label bif:contains "'$key'" . 
} 
ORDER BY UCASE(?label)
LIMIT 15
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_search_URI_contains",
  `
SELECT DISTINCT ?uri ?label
WHERE {
  ?domain $type $domain .
  ?domain $property ?uri .
  ?uri $type $range .
  FILTER(isIRI(?uri))
  BIND(STR(?uri) AS ?label)
  FILTER(CONTAINS(LCASE(?label), LCASE("$key"))) 
} 
ORDER BY UCASE(?label)
LIMIT 15
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_search_literal_contains",
  `
SELECT DISTINCT ?value ?label
WHERE {
  ?domain $type $domain .
  ?domain $property ?value .
  FILTER(isLiteral(?value))
  BIND(STR(?value) AS ?label)
  FILTER(CONTAINS(LCASE(STR(?value)), LCASE("$key"))) 
} 
ORDER BY UCASE(?label)
LIMIT 15
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_search_literal_strstarts",
  `
SELECT DISTINCT ?value ?label
WHERE {
  ?domain $type $domain .
  ?domain $property ?value .
  FILTER(isLiteral(?value))
  BIND(STR(?value) AS ?label)
  FILTER(STRSTARTS(LCASE(STR(?value)), LCASE("$key"))) 
} 
ORDER BY UCASE(?label)
LIMIT 15
`
);


QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_tree_children",
  `
# Selects the children of a node
SELECT DISTINCT ?uri ?label ?hasChildren
WHERE {
  $node $childrenPath ?uri .
  ?uri $labelPath ?label .
  FILTER(isIRI(?uri))
  FILTER(lang(?label) = '' || lang(?label) = $lang)
  OPTIONAL {
    ?uri $childrenPath ?children .
  }
  BIND(IF(bound(?children),true,false) AS ?hasChildren)
}
ORDER BY UCASE(?label)
`
);



QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_tree_children_with_count",
  `
SELECT ?uri (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) ?hasChildren ?count  (STR(?theLabel) AS ?itemLabel)
WHERE {
  {
  SELECT DISTINCT ?uri ?theLabel ?hasChildren (COUNT(?x) AS ?count)
  WHERE {
    {
      SELECT ?uri ?theLabel ?hasChildren
      WHERE {
        $node $childrenPath ?uri .
        ?uri $labelPath ?theLabel .
        FILTER(isIRI(?uri))
        FILTER(lang(?theLabel) = '' || lang(?theLabel) = $lang)
        OPTIONAL {
          ?uri $childrenPath ?children .
        }
        BIND(IF(bound(?children),true,false) AS ?hasChildren)
      }
    }

    OPTIONAL {
      ?x $type $domain .
      ?x $property ?uri .
      # no range criteria
      # ?uri a $range .
    }
  }
  GROUP BY ?uri ?theLabel ?hasChildren
  }
}
ORDER BY UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_tree_root_noparent",
  `
SELECT ?uri ?label ?hasChildren
WHERE {
  ?uri $type $range .
  FILTER NOT EXISTS {
    ?parent $childrenPath ?uri .
  }
  ?uri $labelPath ?label .
  FILTER(isIRI(?uri))
  FILTER(lang(?label) = '' || lang(?label) = $lang)
  OPTIONAL {
    ?uri $childrenPath ?children .
  }
  BIND(IF(bound(?children),true,false) AS ?hasChildren)
}
ORDER BY UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_tree_root_noparent_with_count",
  `
SELECT ?uri (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) ?hasChildren ?count  (STR(?theLabel) AS ?itemLabel)
WHERE {
  {
  SELECT ?uri ?theLabel ?hasChildren (COUNT(?x) AS ?count)
  WHERE {
    {
      SELECT ?uri ?theLabel ?hasChildren
      WHERE {
        ?uri $type $range .
        FILTER NOT EXISTS {
          ?parent $childrenPath ?uri .
        }
        ?uri $labelPath ?theLabel .
        FILTER(isIRI(?uri))
        FILTER(lang(?theLabel) = '' || lang(?theLabel) = $lang)
        OPTIONAL {
          ?uri $childrenPath ?children .
        }
        BIND(IF(bound(?children),true,false) AS ?hasChildren)
      }
    }

    OPTIONAL {
      ?x $type $domain .
      ?x $property ?uri .
    }
  }
  GROUP BY ?uri ?theLabel ?hasChildren
  }
} 
ORDER BY UCASE(?label)
`
);

QUERY_STRINGS_BY_QUERY_TEMPLATE.set(
  SPARNATURAL_CONFIG_DATASOURCES + "query_tree_root_domain",
  `
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#>
SELECT DISTINCT ?uri ?label ?hasChildren
WHERE {
  VALUES ?uri {$domain}
  ?uri $labelPath ?label .
  OPTIONAL {
    ?uri $childrenPath ?children .
  }
  FILTER(lang(?label) = '' || lang(?label) = $lang)
  BIND(IF(bound(?children),true,false) AS ?hasChildren)
}
`
);


var DATASOURCES_CONFIG = new Map();

// # literal lists

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "literal_list_alpha", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_literal_list_alpha"
  ),
});

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "literal_list_count", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_literal_list_count"
  ),
  noSort: true,
});

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "literal_list_alpha_with_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_literal_list_alpha_with_count"
    ),
  }
);

// # Raw URI lists

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "list_URI_alpha", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_alpha"
  ),
  labelProperty: null,
});
DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "list_URI_count", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_count"
  ),
  labelProperty: null,
  noSort: true,
});

// # URI or literals lists

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "list_URI_or_literal_alpha", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_alpha"
  ),
  labelProperty: null,
});
DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "list_URI_or_literal_count", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_count"
  ),
  labelProperty: null,
  noSort: true,
});
DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "list_URI_or_literal_alpha_with_count", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_alpha_with_count"
  ),
  labelProperty: null,
});

// # URI with labels lists

// ## rdfs:label

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_rdfslabel_alpha",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha"
    ),
    labelProperty: "http://www.w3.org/2000/01/rdf-schema#label",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_rdfslabel_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_count"
    ),
    labelProperty: "http://www.w3.org/2000/01/rdf-schema#label",
    noSort: true,
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_rdfslabel_alpha_with_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha_with_count"
    ),
    labelProperty: "http://www.w3.org/2000/01/rdf-schema#label",
  }
);

// ## skos:prefLabel

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_skospreflabel_alpha",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha"
    ),
    labelProperty: "http://www.w3.org/2004/02/skos/core#prefLabel",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_skospreflabel_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_count"
    ),
    labelProperty: "http://www.w3.org/2004/02/skos/core#prefLabel",
    noSort: true,
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_skospreflabel_alpha_with_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha_with_count"
    ),
    labelProperty: "http://www.w3.org/2004/02/skos/core#prefLabel",
  }
);

// ## dcterms:title

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_dctermstitle_alpha",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha"
    ),
    labelProperty: "http://purl.org/dc/terms/title",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_dctermstitle_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_count"
    ),
    labelProperty: "http://purl.org/dc/terms/title",
    noSort: true,
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_dctermstitle_alpha_with_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha_with_count"
    ),
    labelProperty: "http://purl.org/dc/terms/title",
  }
);

// ## foaf:name

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "list_foafname_alpha", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha"
  ),
  labelProperty: "http://xmlns.com/foaf/0.1/name",
});
DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "list_foafname_count", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_count"
  ),
  labelProperty: "http://xmlns.com/foaf/0.1/name",
  noSort: true,
});
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_foafname_alpha_with_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha_with_count"
    ),
    labelProperty: "http://xmlns.com/foaf/0.1/name",
  }
);

// ## schema:name

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_schemaname_alpha",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha"
    ),
    labelProperty: "http://schema.org/name",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_schemaname_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_count"
    ),
    labelProperty: "http://schema.org/name",
    noSort: true,
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "list_schemaname_alpha_with_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha_with_count"
    ),
    labelProperty: "http://schema.org/name",
  }
);

// # Search datasources

// ## rdfs:label

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_rdfslabel_strstarts",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_strstarts"
    ),
    labelProperty: "http://www.w3.org/2000/01/rdf-schema#label",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_rdfslabel_contains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_contains"
    ),
    labelProperty: "http://www.w3.org/2000/01/rdf-schema#label",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_rdfslabel_bifcontains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_bifcontains"
    ),
    labelProperty: "http://www.w3.org/2000/01/rdf-schema#label",
  }
);

// ## foaf:name

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_foafname_strstarts",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_strstarts"
    ),
    labelProperty: "http://xmlns.com/foaf/0.1/name",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_foafname_contains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_contains"
    ),
    labelProperty: "http://xmlns.com/foaf/0.1/name",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_foafname_bifcontains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_bifcontains"
    ),
    labelProperty: "http://xmlns.com/foaf/0.1/name",
  }
);

// ## skos:prefLabel

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_skospreflabel_strstarts",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_strstarts"
    ),
    labelProperty: "http://www.w3.org/2004/02/skos/core#prefLabel",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_skospreflabel_contains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_contains"
    ),
    labelProperty: "http://www.w3.org/2004/02/skos/core#prefLabel",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_skospreflabel_bifcontains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_bifcontains"
    ),
    labelProperty: "http://www.w3.org/2004/02/skos/core#prefLabel",
  }
);

// ## dcterms:title

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_strstarts",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_strstarts"
    ),
    labelProperty: "http://purl.org/dc/terms/title",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_contains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_contains"
    ),
    labelProperty: "http://purl.org/dc/terms/title",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_bifcontains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_bifcontains"
    ),
    labelProperty: "http://purl.org/dc/terms/title",
  }
);

// ## schema:name

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_schemaname_strstarts",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_strstarts"
    ),
    labelProperty: "http://schema.org/name",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_schemaname_contains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_contains"
    ),
    labelProperty: "http://schema.org/name",
  }
);
DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "search_schemaname_bifcontains",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_bifcontains"
    ),
    labelProperty: "http://schema.org/name",
  }
);

// ## search on URI that contains a string

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "search_URI_contains", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_search_URI_contains"
  ),
});

// ## search on literals

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "search_literal_contains", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_search_literal_contains"
  ),
});

DATASOURCES_CONFIG.set(SPARNATURAL_CONFIG_DATASOURCES + "search_literal_strstarts", {
  queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
    SPARNATURAL_CONFIG_DATASOURCES + "query_search_literal_strstarts"
  ),
});



// # Tree datasources

// ## Tree roots datasources

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "tree_root_skostopconcept",
  {
    queryString: `
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri ?label ?hasChildren
WHERE {
  $range skos:hasTopConcept|^skos:topConceptOf ?uri .
  ?uri skos:prefLabel ?label .
  FILTER(isIRI(?uri))
  FILTER(lang(?label) = '' || lang(?label) = $lang)
  OPTIONAL {
    ?uri skos:narrower|^skos:broader ?children .
  }
  BIND(IF(bound(?children),true,false) AS ?hasChildren)
}
ORDER BY UCASE(?label)
`,
  }
);

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "tree_root_skostopconcept_with_count",
  {
    queryString: `
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri (CONCAT(STR(?theLabel), ' (', STR(?count), ')') AS ?label) ?hasChildren ?count
WHERE {
  {
    SELECT ?uri ?theLabel ?hasChildren (COUNT(?x) AS ?count)
    WHERE {
      {
        SELECT ?uri ?theLabel ?hasChildren
        WHERE {
          $range skos:hasTopConcept|^skos:topConceptOf ?uri .
          ?uri skos:prefLabel ?theLabel .
          FILTER(isIRI(?uri))
          FILTER(lang(?theLabel) = '' || lang(?theLabel) = $lang)
          OPTIONAL {
            ?uri skos:narrower|^skos:broader ?children .
          }
          BIND(IF(bound(?children),true,false) AS ?hasChildren)
        }
      }

      OPTIONAL {
        ?x a $domain .
        ?x $property ?uri .
        # no range criteria
        # ?uri a $range .
      }
    }
    GROUP BY ?uri ?theLabel ?hasChildren
  }
} ORDER BY UCASE(?label)
`,
  }
);

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "tree_root_domain_subClassOf",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_tree_root_domain"
    ),
    childrenPath:
      "^<http://www.w3.org/2000/01/rdf-schema#subClassOf>",
    labelPath: "<http://www.w3.org/2000/01/rdf-schema#label>",
  }
);

// ## Tree children datasources

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "tree_children_skosnarrower",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_tree_children"
    ),
    childrenPath:
      "<http://www.w3.org/2004/02/skos/core#narrower>|^<http://www.w3.org/2004/02/skos/core#broader>",
    labelPath: "<http://www.w3.org/2004/02/skos/core#prefLabel>",
  }
);

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "tree_children_skosnarrower_with_count",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_tree_children_with_count"
    ),
    childrenPath:
      "<http://www.w3.org/2004/02/skos/core#narrower>|^<http://www.w3.org/2004/02/skos/core#broader>",
    labelPath: "<http://www.w3.org/2004/02/skos/core#prefLabel>",
  }
);

DATASOURCES_CONFIG.set(
  SPARNATURAL_CONFIG_DATASOURCES + "tree_children_subClassOf",
  {
    queryTemplate: QUERY_STRINGS_BY_QUERY_TEMPLATE.get(
      SPARNATURAL_CONFIG_DATASOURCES + "query_tree_children"
    ),
    childrenPath:
      "^<http://www.w3.org/2000/01/rdf-schema#subClassOf>",
    labelPath: "<http://www.w3.org/2000/01/rdf-schema#label>",
  }
);

const Datasources = Object.freeze({
  SPARNATURAL_CONFIG_DATASOURCES: SPARNATURAL_CONFIG_DATASOURCES,

  // annotation and data properties
  DATASOURCE: SPARNATURAL_CONFIG_DATASOURCES + "datasource",
  TREE_ROOTS_DATASOURCE: SPARNATURAL_CONFIG_DATASOURCES + "treeRootsDatasource",
  TREE_CHILDREN_DATASOURCE:
    SPARNATURAL_CONFIG_DATASOURCES + "treeChildrenDatasource",
  LABEL_PATH: SPARNATURAL_CONFIG_DATASOURCES + "labelPath",
  LABEL_PROPERTY: SPARNATURAL_CONFIG_DATASOURCES + "labelProperty",
  CHILDREN_PATH: SPARNATURAL_CONFIG_DATASOURCES + "childrenPath",
  CHILDREN_PROPERTY: SPARNATURAL_CONFIG_DATASOURCES + "childrenProperty",
  QUERY_STRING: SPARNATURAL_CONFIG_DATASOURCES + "queryString",
  SPARQL_ENDPOINT_URL: SPARNATURAL_CONFIG_DATASOURCES + "sparqlEndpointUrl",
  NO_SORT: SPARNATURAL_CONFIG_DATASOURCES + "noSort",

  // object properties
  QUERY_TEMPLATE: SPARNATURAL_CONFIG_DATASOURCES + "queryTemplate",

  // individuals
  QUERY_LIST_URI_ALPHA: SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_alpha",
  QUERY_LIST_URI_COUNT: SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_count",
  QUERY_LIST_LABEL_ALPHA:
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_alpha",
  QUERY_LIST_LABEL_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_count",
  QUERY_LIST_LABEL_WITH_RANGE_ALPHA:
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_with_range_alpha",
  QUERY_LIST_LABEL_WITH_RANGE_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_label_with_range_count",
  QUERY_LIST_URI_OR_LITERAL_ALPHA:
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_alpha",
  QUERY_LIST_URI_OR_LITERAL_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_count",
  QUERY_LIST_URI_OR_LITERAL_ALPHA_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "query_list_URI_or_literal_alpha_with_count",
  QUERY_SEARCH_LABEL_STRSTARTS:
    SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_strstarts",
  QUERY_SEARCH_LABEL_CONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_contains",
  QUERY_SEARCH_LABEL_BIFCONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "query_search_label_bifcontains",
  QUERY_SEARCH_URI_CONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "query_search_URI_contains",
  QUERY_TREE_CHILDREN: SPARNATURAL_CONFIG_DATASOURCES + "query_tree_children",
  QUERY_TREE_CHILDREN_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "query_tree_children_with_count",
  QUERY_TREE_ROOT_NOPARENT:
    SPARNATURAL_CONFIG_DATASOURCES + "query_tree_root_noparent",
  QUERY_TREE_ROOT_NOPARENT_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "query_tree_root_noparent_with_count",
  QUERY_TREE_ROOT_DOMAIN:
    SPARNATURAL_CONFIG_DATASOURCES + "query_tree_root_domain",

  LITERAL_LIST_ALPHA: SPARNATURAL_CONFIG_DATASOURCES + "literal_list_alpha",
  LITERAL_LIST_COUNT: SPARNATURAL_CONFIG_DATASOURCES + "literal_list_count",
  LITERAL_LIST_ALPHA_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "literal_list_alpha_with_count",

  LIST_URI_ALPHA: SPARNATURAL_CONFIG_DATASOURCES + "list_URI_alpha",
  LIST_URI_COUNT: SPARNATURAL_CONFIG_DATASOURCES + "list_URI_count",

  LIST_URI_OR_LITERAL_COUNT: SPARNATURAL_CONFIG_DATASOURCES + "list_URI_or_literal_count",
  LIST_URI_OR_LITERAL_ALPHA: SPARNATURAL_CONFIG_DATASOURCES + "list_URI_or_literal_alpha",
  LIST_URI_OR_LITERAL_ALPHA_WITH_COUNT: SPARNATURAL_CONFIG_DATASOURCES + "list_URI_or_literal_alpha_with_count",

  LIST_RDFSLABEL_ALPHA: SPARNATURAL_CONFIG_DATASOURCES + "list_rdfslabel_alpha",
  LIST_RDFSLABEL_COUNT: SPARNATURAL_CONFIG_DATASOURCES + "list_rdfslabel_count",
  LIST_RDFSLABEL_ALPHA_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "list_rdfslabel_alpha_with_count",
  LIST_SKOSPREFLABEL_ALPHA:
    SPARNATURAL_CONFIG_DATASOURCES + "list_skospreflabel_alpha",
  LIST_SKOSPREFLABEL_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "list_skospreflabel_count",
  LIST_SKOSPREFLABEL_ALPHA_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "list_skospreflabel_alpha_with_count",
  LIST_FOAFNAME_ALPHA: SPARNATURAL_CONFIG_DATASOURCES + "list_foafname_alpha",
  LIST_FOAFNAME_COUNT: SPARNATURAL_CONFIG_DATASOURCES + "list_foafname_count",
  LIST_FOAFNAME_ALPHA_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "list_foafname_alpha_with_count",
  LIST_DCTERMSTITLE_ALPHA:
    SPARNATURAL_CONFIG_DATASOURCES + "list_dctermstitle_alpha",
  LIST_DCTERMSTITLE_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "list_dctermstitle_count",
  LIST_DCTERMSTITLE_ALPHA_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "list_dctermstitle_alpha_with_count",

  SEARCH_RDFSLABEL_STRSTARTS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_rdfslabel_strstarts",
  SEARCH_FOAFNAME_STRSTARTS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_foafname_strstarts",
  SEARCH_SKOSPREFLABEL_STRSTARTS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_skospreflabel_strstarts",
  SEARCH_DCTERMSTITLE_STRSTARTS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_strstarts",
  SEARCH_SCHEMANAME_STRSTARTS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_strstarts",

  SEARCH_RDFSLABEL_CONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_rdfslabel_contains",
  SEARCH_FOAFNAME_CONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_foafname_contains",
  SEARCH_SKOSPREFLABEL_CONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_skospreflabel_contains",
  SEARCH_DCTERMSTITLE_CONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_contains",
  SEARCH_SCHEMANAME_CONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_contains",

  SEARCH_RDFSLABEL_BIFCONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_rdfslabel_bifcontains",
  SEARCH_DCTERMSTITLE_BIFCONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_dctermstitle_bifcontains",
  SEARCH_FOAFNAME_BIFCONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_foafname_bifcontains",
  SEARCH_SCHEMANAME_BIFCONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_schemaname_bifcontains",
  SEARCH_SKOSPREFLABEL_BIFCONTAINS:
    SPARNATURAL_CONFIG_DATASOURCES + "search_skospreflabel_bifcontains",

  SEARCH_URI_CONTAINS: SPARNATURAL_CONFIG_DATASOURCES + "search_URI_contains",

  SEARCH_LITERAL_CONTAINS: SPARNATURAL_CONFIG_DATASOURCES + "search_literal_contains",
  SEARCH_LITERAL_STRSTARTS: SPARNATURAL_CONFIG_DATASOURCES + "search_literal_strstrats",

  TREE_ROOT_SKOSTOPCONCEPT:
    SPARNATURAL_CONFIG_DATASOURCES + "tree_root_skostopconcept",
  TREE_ROOT_SKOSTOPCONCEPT_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "tree_root_skostopconcept_with_count",
  TREE_ROOT_DOMAIN_SUBCLASSOF:
    SPARNATURAL_CONFIG_DATASOURCES + "tree_root_domain_subClassOf",

  TREE_CHILDREN_SKOSNARROWER:
    SPARNATURAL_CONFIG_DATASOURCES + "tree_children_skosnarrower",
  TREE_CHILDREN_SKOSNARROWER_WITH_COUNT:
    SPARNATURAL_CONFIG_DATASOURCES + "tree_children_skosnarrower_with_count",
  TREE_CHILDREN_SUBCLASSOF:
    SPARNATURAL_CONFIG_DATASOURCES + "tree_children_subClassOf",

  QUERY_STRINGS_BY_QUERY_TEMPLATE: QUERY_STRINGS_BY_QUERY_TEMPLATE,
  DATASOURCES_CONFIG: DATASOURCES_CONFIG,
});

export default Datasources;
