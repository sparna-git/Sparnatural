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
    },
    {
        queryName:'Where test',
        query: `{
            "distinct": true,
            "variables": [
                "Person_1"
            ],
            "lang": "en",
            "order": "noord",
            "branches": [
                {
                    "line": {
                        "s": "?Person_1",
                        "p": "?datededécès_3",
                        "pType": "http://dbpedia.org/ontology/deathDate",
                        "o": "?Date_2",
                        "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                        "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Date",
                        "values": [
                            {
                                "valueType": 0,
                                "value": {
                                    "key": "Sun Jan 01 2017 00:00:01 GMT+0100 (Central European Standard Time) - Fri Dec 31 2021 23:59:59 GMT+0100 (Central European Standard Time)",
                                    "label": "from 2017 to 2021",
                                    "start": "2016-12-31T23:00:01.000Z",
                                    "stop": "2021-12-31T22:59:59.000Z"
                                }
                            }
                        ]
                    },
                    "children": [],
                    "optional": false,
                    "notExists": false
                },
                {
                    "line": {
                        "s": "?Person_1",
                        "p": "?acréé_5",
                        "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#created",
                        "o": "?Artwork_4",
                        "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                        "oType": "http://dbpedia.org/ontology/Artwork",
                        "values": []
                    },
                    "children": [
                        {
                            "line": {
                                "s": "?Artwork_4",
                                "p": "?nom_7",
                                "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#a_label",
                                "o": "?Text_6",
                                "sType": "http://dbpedia.org/ontology/Artwork",
                                "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Text",
                                "values": [
                                    {
                                        "valueType": 0,
                                        "value": {
                                            "key": "testtext",
                                            "label": "testtext",
                                            "search": "testtext"
                                        }
                                    }
                                ]
                            },
                            "children": [],
                            "optional": false,
                            "notExists": false
                        },
                        {
                            "line": {
                                "s": "?Artwork_4",
                                "p": "?exposéeà_9",
                                "pType": "http://dbpedia.org/ontology/museum",
                                "o": "?Museum_8",
                                "sType": "http://dbpedia.org/ontology/Artwork",
                                "oType": "http://dbpedia.org/ontology/Museum",
                                "values": [
                                    {
                                        "valueType": 0,
                                        "value": {
                                            "label": "Any"
                                        }
                                    }
                                ]
                            },
                            "children": [],
                            "optional": false,
                            "notExists": false
                        }
                    ],
                    "optional": false,
                    "notExists": false
                }
            ]
        }`
    }
    ],
  };
  