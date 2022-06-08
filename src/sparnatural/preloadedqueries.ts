/*
    This is just a sample file to demonstrate the feature of preloaded queries
*/


export const queries = {
    queries: [
        {
            queryName:'search mueseums in cuba',
            query:`{
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
                            "o": "?Country_2",
                            "sType": "http://dbpedia.org/ontology/Museum",
                            "oType": "http://dbpedia.org/ontology/Country",
                            "values": [
                                {
                                    "key": "http://dbpedia.org/resource/Cuba",
                                    "label": "Cuba (1)",
                                    "uri": "http://dbpedia.org/resource/Cuba"
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
            queryName:`search Tree within Area`,
            query: `{
                "distinct": true,
                "variables": [
                    "Tree_1"
                ],
                "lang": "en",
                "order": "desc",
                "branches": [
                    {
                        "line": {
                            "s": "?Tree_1",
                            "p": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#withinArea",
                            "o": "?Area_2",
                            "sType": "http://dbpedia.org/ontology/Tree",
                            "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Area",
                            "values": [
                                {
                                    "label": "Area selected",
                                    "coordinates": [
                                        [
                                            {
                                                "lat": 46.19331763457561,
                                                "lng": 6.109737394144759
                                            },
                                            {
                                                "lat": 46.22479821864722,
                                                "lng": 6.109737394144759
                                            },
                                            {
                                                "lat": 46.22479821864722,
                                                "lng": 6.1632957437541345
                                            },
                                            {
                                                "lat": 46.19331763457561,
                                                "lng": 6.1632957437541345
                                            }
                                        ]
                                    ]
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
            queryName:`search country with museam and person and person with artwork`,
            query:`{
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
                            "p": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#countryOf",
                            "o": "?Museum_2",
                            "sType": "http://dbpedia.org/ontology/Country",
                            "oType": "http://dbpedia.org/ontology/Museum",
                            "values": []
                        },
                        "children": [
                            {
                                "line": {
                                    "s": "?Museum_2",
                                    "p": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#text",
                                    "o": "?Search_4",
                                    "sType": "http://dbpedia.org/ontology/Museum",
                                    "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Search",
                                    "values": [
                                        {
                                            "key": "testsearch",
                                            "label": "testsearch",
                                            "search": "testsearch"
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
                    },
                    {
                        "line": {
                            "s": "?Country_1",
                            "p": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#birthPlace",
                            "o": "?Person_6",
                            "sType": "http://dbpedia.org/ontology/Country",
                            "oType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                            "values": []
                        },
                        "children": [
                            {
                                "line": {
                                    "s": "?Person_6",
                                    "p": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#created",
                                    "o": "?Artwork_8",
                                    "sType": "http://labs.sparna.fr/sparnatural-demo-dbpedia/onto#Person",
                                    "oType": "http://dbpedia.org/ontology/Artwork",
                                    "values": [
                                        {
                                            "label": "Any"
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
    ]
}