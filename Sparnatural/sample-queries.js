var queries = [
  {
    label_en: "Artworks displayed in Italian museums",
    label_fr: "Les œuvres exposées dans des musées italiens",
    query: {
      distinct: true,
      variables: [
        {
          termType: "Variable",
          value: "Artwork_1",
        },
        {
          termType: "Variable",
          value: "Museum_2",
        },
        {
          termType: "Variable",
          value: "Country_4",
        },
      ],
      order: null,
      branches: [
        {
          line: {
            s: "Artwork_1",
            p: "https://data.mydomain.com/ontologies/sparnatural-config/Artwork_displayedAt",
            o: "Museum_2",
            sType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Artwork",
            oType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Museum",
            values: [],
          },
          children: [
            {
              line: {
                s: "Museum_2",
                p: "https://data.mydomain.com/ontologies/sparnatural-config/Museum_country",
                o: "Country_4",
                sType:
                  "https://data.mydomain.com/ontologies/sparnatural-config/Museum",
                oType:
                  "https://data.mydomain.com/ontologies/sparnatural-config/Country",
                values: [
                  {
                    label: "Italy",
                    rdfTerm: {
                      type: "uri",
                      value: "http://dbpedia.org/resource/Italy",
                    },
                  },
                ],
              },
              children: [],
            },
          ],
        },
      ],
    },
  },
  {
    label_en: "Museums where Van Goghs artworks are displayed",
    label_fr: "Les musées qui exposent les oeuvres de Vincent Van Gogh",
    query: {
      distinct: true,
      variables: [
        {
          termType: "Variable",
          value: "Museum_1",
        },
        {
          termType: "Variable",
          value: "Artwork_2",
        },
        {
          termType: "Variable",
          value: "Person_4",
        },
      ],
      order: null,
      branches: [
        {
          line: {
            s: "Museum_1",
            p: "https://data.mydomain.com/ontologies/sparnatural-config/Museum_displays",
            o: "Artwork_2",
            sType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Museum",
            oType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Artwork",
            values: [],
          },
          children: [
            {
              line: {
                s: "Artwork_2",
                p: "https://data.mydomain.com/ontologies/sparnatural-config/Artwork_author",
                o: "Person_4",
                sType:
                  "https://data.mydomain.com/ontologies/sparnatural-config/Artwork",
                oType:
                  "https://data.mydomain.com/ontologies/sparnatural-config/Person",
                values: [
                  {
                    label: "Vincent van Gogh",
                    rdfTerm: {
                      type: "uri",
                      value: "http://dbpedia.org/resource/Vincent_van_Gogh",
                    },
                  },
                ],
              },
              children: [],
            },
          ],
        },
      ],
    },
  },
  {
    label_en:
      "19th Century French women artists, movements, artworks & museums",
    label_fr:
      "Les artistes françaises du XIXe, mouvements, œuvres & lieux d'exposition",
    query: {
      distinct: true,
      variables: [
        {
          termType: "Variable",
          value: "Person_1",
        },
        {
          termType: "Variable",
          value: "Category_2",
        },
        {
          termType: "Variable",
          value: "Movement_6",
        },
        {
          termType: "Variable",
          value: "Artwork_8",
        },
        {
          termType: "Variable",
          value: "Museum_10",
        },
      ],
      order: null,
      branches: [
        {
          line: {
            s: "Person_1",
            p: "https://data.mydomain.com/ontologies/sparnatural-config/Person_classifiedIn",
            o: "Category_2",
            sType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Person",
            oType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Category",
            values: [
              {
                label: "19th-century French women artists",
                rdfTerm: {
                  type: "uri",
                  value:
                    "http://dbpedia.org/resource/Category:19th-century_French_women_artists",
                },
              },
            ],
          },
          children: [],
        },
        {
          line: {
            s: "Person_1",
            p: "https://data.mydomain.com/ontologies/sparnatural-config/Person_movement",
            o: "Movement_6",
            sType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Person",
            oType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Movement",
            values: [],
          },
          children: [],
          optional: true,
        },
        {
          line: {
            s: "Person_1",
            p: "https://data.mydomain.com/ontologies/sparnatural-config/Person_created",
            o: "Artwork_8",
            sType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Person",
            oType:
              "https://data.mydomain.com/ontologies/sparnatural-config/Artwork",
            values: [],
          },
          children: [
            {
              line: {
                s: "Artwork_8",
                p: "https://data.mydomain.com/ontologies/sparnatural-config/Artwork_displayedAt",
                o: "Museum_10",
                sType:
                  "https://data.mydomain.com/ontologies/sparnatural-config/Artwork",
                oType:
                  "https://data.mydomain.com/ontologies/sparnatural-config/Museum",
                values: [],
              },
              children: [],
              optional: true,
            },
          ],
          optional: true,
        },
      ],
    },
  },
];
