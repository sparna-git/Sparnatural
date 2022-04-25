
const config = {
  "@context": {
    Ontology: "http://www.w3.org/2002/07/owl#Ontology",
    Class: "http://www.w3.org/2002/07/owl#Class",
    ObjectProperty: "http://www.w3.org/2002/07/owl#ObjectProperty",
    label: "http://www.w3.org/2000/01/rdf-schema#label",
    domain: {
      "@id": "http://www.w3.org/2000/01/rdf-schema#domain",
      "@type": "@id",
    },
    range: {
      "@id": "http://www.w3.org/2000/01/rdf-schema#range",
      "@type": "@id",
    },
    unionOf: {
      "@id": "http://www.w3.org/2002/07/owl#unionOf",
      "@type": "@id",
    },
    subPropertyOf: {
      "@id": "http://www.w3.org/2000/01/rdf-schema#subPropertyOf",
      "@type": "@id",
    },
    faIcon:
      "http://data.sparna.fr/ontologies/sparnatural-config-core#faIcon",
    tooltip:
      "http://data.sparna.fr/ontologies/sparnatural-config-core#tooltip",
    sparqlString:
      "http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString",
    sparnatural:
      "http://data.sparna.fr/ontologies/sparnatural-config-core#",
    datasources:
      "http://data.sparna.fr/ontologies/sparnatural-config-datasources#",
  },
  "@graph": [
    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto",
      "@type": "Ontology",
    },
    {
      "@id": "http://dbpedia.org/ontology/Museum",
      "@type": "Class",
      label: [
        { "@value": "Museum", "@language": "en" },
        { "@value": "Musée", "@language": "fr" },
      ],
      faIcon: "fas fa-university",
      defaultLabelProperty:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#auto_label",
    },
    {
      "@id": "http://dbpedia.org/ontology/Country",
      "@type": "Class",
      label: [
        { "@value": "Country", "@language": "en" },
        { "@value": "Pays", "@language": "fr" },
      ],
      tooltip: [
        { "@value": "en", "@language": "en" },
        { "@value": "fr", "@language": "fr" },
      ],
      faIcon: "fas fa-globe-africa",
    },
    {
      "@id": "http://dbpedia.org/ontology/Artwork",
      "@type": "Class",
      label: [
        { "@value": "Artwork", "@language": "en" },
        { "@value": "Oeuvre", "@language": "fr" },
      ],
      faIcon: "fas fa-paint-brush",
    },
    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      "@type": "Class",
      label: [
        { "@value": "Person", "@language": "en" },
        { "@value": "Personne", "@language": "fr" },
      ],
      tooltip: [
        {
          "@value":
            "This is a person blah blah blah in the tooltip and this should be approximately this size long and maybe a bit longer.",
          "@language": "en",
        },
        {
          "@value":
            "This is a person blah blah blah in the tooltip and this should be approximately this size long and maybe a bit longer.",
          "@language": "fr",
        },
      ],
      faIcon: "fas fa-male",
      sparqlString: "<http://dbpedia.org/ontology/Person>",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Unknown",
      "@type": "Class",
      label: [
        { "@value": "Unknown class", "@language": "en" },
        { "@value": "Classe inconnue", "@language": "fr" },
      ],
      faIcon: "fas fa-male",
    },
    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Search",
      "@type": "Class",
      subClassOf: "http://www.w3.org/2000/01/rdf-schema#Literal",
      label: [
        { "@value": "Search", "@language": "en" },
        { "@value": "Rechercher", "@language": "fr" },
      ],
      faIcon: "fas fa-search",
    },
    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Date",
      "@type": "Class",
      subClassOf: "http://www.w3.org/2000/01/rdf-schema#Literal",
      label: [
        { "@value": "Date", "@language": "en" },
        { "@value": "Date", "@language": "fr" },
      ],
      faIcon: "fas fa-calendar-alt",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Movement",
      "@type": "Class",
      subClassOf: "sparnatural:NotInstantiatedClass",
      label: [
        { "@value": "Movement", "@language": "en" },
        { "@value": "Mouvement", "@language": "fr" },
      ],
      faIcon: "fas fa-palette",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Category",
      "@type": "Class",
      subClassOf: "sparnatural:NotInstantiatedClass",
      label: [
        { "@value": "Category", "@language": "en" },
        { "@value": "Catégorie", "@language": "fr" },
      ],
      faIcon: "fas fa-palette",
    },
    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Text",
      "@type": "Class",
      subClassOf: "http://www.w3.org/2000/01/rdf-schema#Literal",
      label: [
        { "@value": "Text", "@language": "en" },
        { "@value": "Texte", "@language": "fr" },
      ],
      faIcon: "fas fa-signature",
    },
    {
      "@id": "http://dbpedia.org/ontology/country",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:ListProperty",
      datasource: "datasources:list_rdfslabel_alpha_with_count",
      label: [
        { "@value": "country", "@language": "en" },
        { "@value": "pays", "@language": "fr" },
      ],
      tooltip: [
        {
          "@value": "A museum can be located in a country",
          "@language": "en",
        },
        {
          "@value": "Un musée peut se trouver dans un pays",
          "@language": "fr",
        },
      ],
      domain: "http://dbpedia.org/ontology/Museum",
      range: "http://dbpedia.org/ontology/Country",
      enableOptional: true,
      enableNegation: true,
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#countryOf",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:AutocompleteProperty",
      label: [
        { "@value": "country of", "@language": "en" },
        { "@value": "lieu de", "@language": "fr" },
      ],
      domain: "http://dbpedia.org/ontology/Country",
      range: "http://dbpedia.org/ontology/Museum",
      sparqlString: "^<http://dbpedia.org/ontology/country>",
    },
    {
      "@id": "http://dbpedia.org/ontology/museum",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:AutocompleteProperty",
      label: [
        { "@value": "displayed at", "@language": "en" },
        { "@value": "exposée à", "@language": "fr" },
      ],
      domain: "http://dbpedia.org/ontology/Artwork",
      range: "http://dbpedia.org/ontology/Museum",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#displays",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:NonSelectableProperty",
      label: [
        { "@value": "displays", "@language": "en" },
        { "@value": "expose", "@language": "fr" },
      ],
      domain: "http://dbpedia.org/ontology/Museum",
      range: "http://dbpedia.org/ontology/Artwork",
      sparqlString: "^<http://dbpedia.org/ontology/museum>",
      enableNegation: true,
    },
    {
      "@id": "http://dbpedia.org/ontology/author",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:AutocompleteProperty",
      label: [
        { "@value": "author", "@language": "en" },
        { "@value": "auteur", "@language": "fr" },
      ],
      domain: "http://dbpedia.org/ontology/Artwork",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      datasource: "datasources:search_rdfslabel_bifcontains",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#created",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:AutocompleteProperty",
      label: [
        { "@value": "created", "@language": "en" },
        { "@value": "a créé", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://dbpedia.org/ontology/Artwork",
      sparqlString: "^<http://dbpedia.org/ontology/author>",
    },
    {
      "@id": "http://fr.dbpedia.org/property/nationalité",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:LiteralListProperty",
      label: [
        { "@value": "nationality", "@language": "en" },
        { "@value": "nationalité", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://dbpedia.org/ontology/Country",
    },

    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:ListProperty",
      label: [
        { "@value": "born in", "@language": "en" },
        { "@value": "né à", "@language": "fr" },
      ],
      tooltip: [
        {
          "@value":
            "the country in which the person was born, which is actually the <em>country of the city in which the person was born <b>!!!</b></em>",
          "@language": "en",
        },
        {
          "@value":
            "the country in which the person was born, which is actually the <em>country of the city in which the person was born <b>!!!</b></em>",
          "@language": "fr",
        },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://dbpedia.org/ontology/Country",
      sparqlString:
        "<http://dbpedia.org/ontology/birthPlace>/<http://dbpedia.org/ontology/country>",
      datasource: "datasources:list_rdfslabel_count",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#birthPlace",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:AutocompleteProperty",
      label: [
        { "@value": "birth place", "@language": "en" },
        { "@value": "lieu de naissance", "@language": "fr" },
      ],
      domain: "http://dbpedia.org/ontology/Country",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      sparqlString:
        "^(<http://dbpedia.org/ontology/birthPlace>/<http://dbpedia.org/ontology/country>)",
    },
    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#diedIn",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:ListProperty",
      label: [
        { "@value": "died at", "@language": "en" },
        { "@value": "mort à", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://dbpedia.org/ontology/Country",
      sparqlString:
        "<http://dbpedia.org/ontology/deathPlace>/<http://dbpedia.org/ontology/country>",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#deathPlace",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:AutocompleteProperty",
      label: [
        { "@value": "death place", "@language": "en" },
        { "@value": "lieu de décès", "@language": "fr" },
      ],
      domain: "http://dbpedia.org/ontology/Country",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      sparqlString:
        "^(<http://dbpedia.org/ontology/deathPlace>/<http://dbpedia.org/ontology/country>)",
    },
    {
      "@id": "http://dbpedia.org/ontology/deathDate",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:TimeProperty-Year",
      label: [
        { "@value": "death date", "@language": "en" },
        { "@value": "date de décès", "@language": "fr" },
      ],
      beginDateProperty: "http://exemple.fr/beginDate",
      endDateProperty: "http://exemple.fr/endDate",
      exactDateProperty: "http://exemple.fr/exactDate",
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Date",
    },
    {
      "@id": "http://dbpedia.org/ontology/birthDate",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:TimeProperty-Date",
      label: [
        { "@value": "birth date", "@language": "en" },
        { "@value": "date de naissance", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Date",
    },
    {
      "@id": "http://dbpedia.org/ontology/movement",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:TreeProperty",
      label: [
        { "@value": "movement", "@language": "en" },
        { "@value": "mouvement", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Movement",
    },
    {
      "@id": "http://purl.org/dc/terms/subject",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:TreeProperty",
      label: [
        { "@value": "category", "@language": "en" },
        { "@value": "catégorie", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Category",
      treeRootsDatasource: {
        queryString: `
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri ?label ?hasChildren
WHERE {
VALUES ?uri {<http://fr.dbpedia.org/resource/Catégorie:Peintre_français>}
?uri skos:prefLabel ?label .
FILTER(lang(?label) = '' || lang(?label) = $lang)
BIND(true AS ?hasChildren)
}
  `,
      },
      treeChildrenDatasource: "datasources:tree_children_skos",
    },
    {
      "@id": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#text",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:GraphDBSearchProperty",
      label: [
        { "@value": "label or description", "@language": "en" },
        { "@value": "libellé ou description", "@language": "fr" },
      ],
      domain: {
        "@type": "Class",
        unionOf: {
          "@list": [
            { "@id": "http://dbpedia.org/ontology/Museum" },
            {
              "@id":
                "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
            },
            { "@id": "http://dbpedia.org/ontology/Artwork" },
          ],
        },
      },
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Search",
      sparqlString: "rdfs:label|rdfs:comment",
    },
    {
      "@id": "http://www.w3.org/2000/01/rdf-schema#label",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:NonSelectableProperty",
      label: [
        { "@value": "name", "@language": "en" },
        { "@value": "nom", "@language": "fr" },
      ],
      domain: "http://dbpedia.org/ontology/Museum",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Text",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#a_label",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:SearchProperty",
      isMultilingual: true,
      label: [
        { "@value": "name", "@language": "en" },
        { "@value": "nom", "@language": "fr" },
      ],
      sparqlString: "rdfs:label",
      domain: {
        "@type": "Class",
        unionOf: {
          "@list": [
            {
              "@id":
                "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
            },
            { "@id": "http://dbpedia.org/ontology/Artwork" },
          ],
        },
      },
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Text",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#auto_label",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:NonSelectableProperty",
      label: [
        { "@value": "name", "@language": "en" },
        { "@value": "nom", "@language": "fr" },
      ],
      sparqlString: "rdfs:label",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Text",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#unknownProperty",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:ListProperty",
      label: [
        { "@value": "unknown property", "@language": "en" },
        { "@value": "propriété inconnue", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Unknown",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#reverseUnknown",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:ListProperty",
      label: [
        { "@value": "unknown property reverse", "@language": "en" },
        { "@value": "propriété inconnue inversée", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Unknown",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#unknownBetweenKnownClasses",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:ListProperty",
      label: [
        {
          "@value": "unknown property between known classes",
          "@language": "en",
        },
        {
          "@value": "propriété inconnue entre classe connues",
          "@language": "fr",
        },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://dbpedia.org/ontology/Museum",
    },
    {
      "@id":
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#isAlive",
      "@type": "ObjectProperty",
      subPropertyOf: "sparnatural:BooleanProperty",
      label: [
        { "@value": "is alive", "@language": "en" },
        { "@value": "est vivant", "@language": "fr" },
      ],
      domain:
        "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
      range: "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Text",
    },
  ],
};
export default config