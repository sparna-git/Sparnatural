/*
    This is just a sample file to demonstrate the feature of preloaded queries
*/

export default {
    queries: [
      {
        queryName: `Museums in South Africa OR Albania`,
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
                                            "key": "testText",
                                            "label": "testText",
                                            "search": "testText"
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
    },
    {
        queryName:`Map test`,
        query:`{
            "distinct": true,
            "variables": [
                "Tree_1"
            ],
            "lang": "en",
            "order": "noord",
            "branches": [
                {
                    "line": {
                        "s": "?Tree_1",
                        "p": "?danslazone_3",
                        "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#hasLocation",
                        "o": "?Location_2",
                        "sType": "http://twin-example/geneva#Tree",
                        "oType": "http://twin-example/geneva#Location",
                        "values": []
                    },
                    "children": [
                        {
                            "line": {
                                "s": "?Location_2",
                                "p": "?danslazone_5",
                                "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#withinArea",
                                "o": "?Area_4",
                                "sType": "http://twin-example/geneva#Location",
                                "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Area",
                                "values": [
                                    {
                                        "valueType": 0,
                                        "value": {
                                            "label": "Area selected",
                                            "coordinates": [
                                                [
                                                    {
                                                        "lat": 46.18643962153715,
                                                        "lng": 6.108911409974098
                                                    },
                                                    {
                                                        "lat": 46.22469393152102,
                                                        "lng": 6.108911409974098
                                                    },
                                                    {
                                                        "lat": 46.22469393152102,
                                                        "lng": 6.175516024231912
                                                    },
                                                    {
                                                        "lat": 46.18643962153715,
                                                        "lng": 6.175516024231912
                                                    }
                                                ]
                                            ]
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
    },
    {
        queryName:`test variable select`,
        query:`{
            "distinct": true,
            "variables": [
                "Museum_1",
                "Museum_1_label",
                "Person_12",
                "Country_2"
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
                },
                {
                    "line": {
                        "s": "?Museum_9",
                        "p": "?pays_11",
                        "pType": "http://dbpedia.org/ontology/country",
                        "o": "?Country_10",
                        "sType": "http://dbpedia.org/ontology/Museum",
                        "oType": "http://dbpedia.org/ontology/Country",
                        "values": []
                    },
                    "children": [
                        {
                            "line": {
                                "s": "?Country_10",
                                "p": "?lieudenaissance_13",
                                "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#birthPlace",
                                "o": "?Person_12",
                                "sType": "http://dbpedia.org/ontology/Country",
                                "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
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
    },
    {
        queryName:`test variable ordering`,
        query:`{
            "distinct": true,
            "variables": [
                "Person_6",
                "Museum_1",
                "Museum_1_label",
                "Country_2"
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
                },
                {
                    "line": {
                        "s": "?Museum_1",
                        "p": "?pays_5",
                        "pType": "http://dbpedia.org/ontology/country",
                        "o": "?Country_4",
                        "sType": "http://dbpedia.org/ontology/Museum",
                        "oType": "http://dbpedia.org/ontology/Country",
                        "values": []
                    },
                    "children": [
                        {
                            "line": {
                                "s": "?Country_4",
                                "p": "?lieudenaissance_7",
                                "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#birthPlace",
                                "o": "?Person_6",
                                "sType": "http://dbpedia.org/ontology/Country",
                                "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
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
    },
    {
        queryName:`test Optional & negatif`,
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
                                    "key": "http://fr.dbpedia.org/resource/Åland",
                                    "label": "Åland (4)",
                                    "uri": "http://fr.dbpedia.org/resource/Åland"
                                }
                            },
                            {
                                "valueType": 1,
                                "value": {
                                    "key": "http://fr.dbpedia.org/resource/Allemagne",
                                    "label": "Allemagne (6681)",
                                    "uri": "http://fr.dbpedia.org/resource/Allemagne"
                                }
                            }
                        ]
                    },
                    "children": [],
                    "optional": true,
                    "notExists": false
                },
                {
                    "line": {
                        "s": "?Museum_1",
                        "p": "?expose_5",
                        "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#displays",
                        "o": "?Artwork_4",
                        "sType": "http://dbpedia.org/ontology/Museum",
                        "oType": "http://dbpedia.org/ontology/Artwork",
                        "values": []
                    },
                    "children": [
                        {
                            "line": {
                                "s": "?Artwork_4",
                                "p": "?auteur_7",
                                "pType": "http://dbpedia.org/ontology/author",
                                "o": "?Person_6",
                                "sType": "http://dbpedia.org/ontology/Artwork",
                                "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
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
                            "notExists": true
                        }
                    ],
                    "optional": false,
                    "notExists": true
                }
            ]
        }`
    },
    {
        queryName: "test literal list widget ",
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
                        "p": "?nationalité_3",
                        "pType": "http://fr.dbpedia.org/property/nationalité",
                        "o": "?Country_2",
                        "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                        "oType": "http://dbpedia.org/ontology/Country",
                        "values": [
                          {
                            "value": {
                              "key": "Afghane",
                              "label": "Afghane",
                              "literal": "Afghane"
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
        queryName : "Test load sort criteria",
        query:`{
          "distinct": true,
          "variables": [
            "Country_2",
            "Museum_1"
          ],
          "lang": "en",
          "order": "asc",
          "branches": [
            {
              "line": {
                "s": "?Museum_1",
                "p": "?country_3",
                "pType": "http://dbpedia.org/ontology/country",
                "o": "?Country_2",
                "sType": "http://dbpedia.org/ontology/Museum",
                "oType": "http://dbpedia.org/ontology/Country",
                "values": [
                  {
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
          ]
        }`
    }
    ],
  };
  