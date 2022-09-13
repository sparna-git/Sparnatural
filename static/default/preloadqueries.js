/*
    This is just a sample file to demonstrate the feature of preloaded queries
*/

export default {
    queries: [
      {
        queryName: `Museums in Cuba OR Egypt`,
        query:`{
            "distinct": true,
            "variables": [
                "Museum_1",
                "Museum_1_label"
            ],
            "lang": "en",
            "order": "noord",
            "branches": [
                {
                    "line": {
                        "s": "?Museum_1",
                        "p": "?pays_3",
                        "pType": "http://dbpedia.org/ontology/country",
                        "o": "?Country_2",
                        "sType": "http://dbpedia.org/ontology/Museum",
                        "oType": "http://dbpedia.org/ontology/Country",
                        "values": [
                            {
                                "valueType": 1,
                                "value": {
                                    "key": "http://fr.dbpedia.org/resource/Afrique_du_Sud",
                                    "label": "Afrique du Sud (104)",
                                    "uri": "http://fr.dbpedia.org/resource/Afrique_du_Sud"
                                }
                            },
                            {
                                "valueType": 1,
                                "value": {
                                    "key": "http://fr.dbpedia.org/resource/Albanie",
                                    "label": "Albanie (31)",
                                    "uri": "http://fr.dbpedia.org/resource/Albanie"
                                }
                            }
                        ]
                    },
                    "children": [],
                    "optional": false,
                    "notExists": false
                }
            ]
        }`
    }
    ],
  };
  