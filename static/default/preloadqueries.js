/*
    This is just a sample file to demonstrate the feature of preloaded queries
*/

export default {
    queries: [
      {
        queryName: `Museums in Cuba OR Egypt`,
        query: `{
                  "distinct": true,
                  "variables": [
                      "Museum_1"
                  ],
                  "lang": "en",
                  "order": "desc",
                  "branches": [
                      {
                          "line": {
                              "s": "?Museum_1",
                              "p": "http://dbpedia.org/ontology/country",
                              "pType": "?country_3",
                              "o": "?Country_2",
                              "sType": "http://dbpedia.org/ontology/Museum",
                              "oType": "http://dbpedia.org/ontology/Country",
                              "values": [
                                  {
                                      "key": "http://dbpedia.org/resource/Cuba",
                                      "label": "Cuba (1)",
                                      "uri": "http://dbpedia.org/resource/Cuba"
                                  },
                                  {
                                      "key": "http://dbpedia.org/resource/Egypt",
                                      "label": "Egypt (2)",
                                      "uri": "http://dbpedia.org/resource/Egypt"
                                  }
                              ]
                          },
                          "children": [],
                          "optional": false,
                          "notExists": false
                      }
                  ]
              }`,
      },
      {
        queryName: `Country with person named peter who died the last 4 years`,
        query: `{
                  "distinct": true,
                  "variables": [
                      "Country_1"
                  ],
                  "lang": "en",
                  "order": "desc",
                  "branches": [
                      {
                          "line": {
                              "s": "?Country_1",
                              "p": "?deathplace_3",
                              "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#deathPlace",
                              "o": "?Person_2",
                              "sType": "http://dbpedia.org/ontology/Country",
                              "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                              "values": []
                          },
                          "children": [
                              {
                                  "line": {
                                      "s": "?Person_2",
                                      "p": "?deathdate_5",
                                      "pType": "http://dbpedia.org/ontology/deathDate",
                                      "o": "?Date_4",
                                      "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                      "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Date",
                                      "values": [
                                          {
                                              "key": "Sun Jan 01 2017 00:00:00 GMT+0100 (Central European Standard Time) Fri Dec 31 2021 23:59:59 GMT+0100 (Central European Standard Time)",
                                              "label": " 2016-12-31 - 2021-12-31",
                                              "start": "2016-12-31T23:00:00.000Z",
                                              "stop": "2021-12-31T22:59:59.000Z"
                                          }
                                      ]
                                  },
                                  "children": [],
                                  "optional": false,
                                  "notExists": false
                              },
                              {
                                  "line": {
                                      "s": "?Person_2",
                                      "p": "?labelordescription_7",
                                      "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#text",
                                      "o": "?Search_6",
                                      "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                      "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Search",
                                      "values": [
                                          {
                                              "key": "peter",
                                              "label": "peter",
                                              "search": "peter"
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
              }`,
      },
      {
        queryName: `Museum with Artwork with name monalisa and OPTIONAL author who was born the last 30years`,
        query: `{
                  "distinct": true,
                  "variables": [
                      "Museum_1"
                  ],
                  "lang": "en",
                  "order": "desc",
                  "branches": [
                      {
                          "line": {
                              "s": "?Museum_1",
                              "p": "?displays_3",
                              "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#displays",
                              "o": "?Artwork_2",
                              "sType": "http://dbpedia.org/ontology/Museum",
                              "oType": "http://dbpedia.org/ontology/Artwork",
                              "values": []
                          },
                          "children": [
                              {
                                  "line": {
                                      "s": "?Artwork_2",
                                      "p": "?author_5",
                                      "pType": "http://dbpedia.org/ontology/author",
                                      "o": "?Person_4",
                                      "sType": "http://dbpedia.org/ontology/Artwork",
                                      "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                      "values": []
                                  },
                                  "children": [
                                      {
                                          "line": {
                                              "s": "?Person_4",
                                              "p": "?birthdate_7",
                                              "pType": "http://dbpedia.org/ontology/birthDate",
                                              "o": "?Date_6",
                                              "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                              "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Date",
                                              "values": [
                                                  {
                                                      "key": "Tue Jun 03 1980 00:00:00 GMT+0100 (Central European Standard Time) Tue Feb 06 2018 23:59:59 GMT+0100 (Central European Standard Time)",
                                                      "label": " 1980-06-02 - 2018-02-06",
                                                      "start": "1980-06-02T23:00:00.000Z",
                                                      "stop": "2018-02-06T22:59:59.000Z"
                                                  }
                                              ]
                                          },
                                          "children": [],
                                          "optional": true,
                                          "notExists": false
                                      }
                                  ],
                                  "optional": true,
                                  "notExists": false
                              },
                              {
                                  "line": {
                                      "s": "?Artwork_2",
                                      "p": "?labelordescription_9",
                                      "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#text",
                                      "o": "?Search_8",
                                      "sType": "http://dbpedia.org/ontology/Artwork",
                                      "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Search",
                                      "values": [
                                          {
                                              "key": "monalisa",
                                              "label": "monalisa",
                                              "search": "monalisa"
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
              }`,
      },
      {
        queryName: "optionaltest",
        query: `{
                  "distinct": true,
                  "variables": [
                      "Museum_1"
                  ],
                  "lang": "en",
                  "order": "desc",
                  "branches": [
                      {
                          "line": {
                              "s": "?Museum_1",
                              "p": "?displays_3",
                              "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#displays",
                              "o": "?Artwork_2",
                              "sType": "http://dbpedia.org/ontology/Museum",
                              "oType": "http://dbpedia.org/ontology/Artwork",
                              "values": []
                          },
                          "children": [
                              {
                                  "line": {
                                      "s": "?Artwork_2",
                                      "p": "?author_5",
                                      "pType": "http://dbpedia.org/ontology/author",
                                      "o": "?Person_4",
                                      "sType": "http://dbpedia.org/ontology/Artwork",
                                      "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                      "values": []
                                  },
                                  "children": [
                                      {
                                          "line": {
                                              "s": "?Person_4",
                                              "p": "?bornin_9",
                                              "pType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#bornIn",
                                              "o": "?Country_6",
                                              "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                              "oType": "http://dbpedia.org/ontology/Country",
                                              "values": [
                                                  {
                                                      "key": "http://dbpedia.org/resource/United_Kingdom",
                                                      "label": "United Kingdom (104194)",
                                                      "uri": "http://dbpedia.org/resource/United_Kingdom"
                                                  }
                                              ]
                                          },
                                          "children": [],
                                          "optional": true,
                                          "notExists": false
                                      }
                                  ],
                                  "optional": true,
                                  "notExists": false
                              },
                              {
                                  "line": {
                                      "s": "?Artwork_2",
                                      "p": "?author_8",
                                      "pType": "http://dbpedia.org/ontology/author",
                                      "o": "?Person_7",
                                      "sType": "http://dbpedia.org/ontology/Artwork",
                                      "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                      "values": []
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
              }`,
      },
    ],
  };
  