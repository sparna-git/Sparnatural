var example_1 = {
  "distinct": true,
  "variables": [
    "Museum_1"
  ],
  "order": null,
  "branches": [
    {
      "line": {
        "s": "?Museum_1",
        "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#country",
        "o": "?Country_2",
        "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Museum",
        "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Country",
        "values": [
          {
            "label": "France (2)",
            "rdfTerm": {
              "type": "uri",
              "value": "http://dbpedia.org/resource/France"
            }
          }
        ]
      },
      "children": []
    }
  ]
}

var example_2 = {
  "distinct": true,
  "variables": [
    "Artwork_1"
  ],
  "order": null,
  "branches": [
    {
      "line": {
        "s": "?Artwork_1",
        "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#author",
        "o": "?Person_2",
        "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Artwork",
        "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Person",
        "values": []
      },
      "children": [
        {
          "line": {
            "s": "?Person_2",
            "p": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#movement",
            "o": "?Movement_4",
            "sType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Person",
            "oType": "http://ontologies.sparna.fr/sparnatural-demo-dbpedia#Movement",
            "values": [
              {
                "label": "Impressionism (232)",
                "rdfTerm": {
                  "type": "uri",
                  "value": "http://dbpedia.org/resource/Impressionism"
                }
              }
            ]
          },
          "children": []
        }
      ]
    }
  ]
}