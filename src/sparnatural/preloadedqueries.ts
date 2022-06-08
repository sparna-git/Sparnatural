/*
    This is just a sample file to demonstrate the feature of preloaded queries
*/
import { ISparJson } from "./sparql/ISparJson"


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
        }
    ]
}