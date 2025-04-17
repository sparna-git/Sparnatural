_[Home](index.html) > Federated query support_

# Federated query support (SERVICE keyword)

## The problem

SPARQL and semantic web in general have the capacity to work in distributed contexts and to resolve queries against *more than one SPARQL endpoint*. Yet this is complicated to comprehend for a user, and even more complicated for a user to specify which part of its query should be routed to which SPARQL service.

## The solution

Starting with v8, Sparnatural provides basic support for federated querying using the `SERVICE` keyword. The idea is that federated querying will be activated for certain properties in your configuration, that you need to configure in advance. Once configured, the use of federated querying will be transparent for the user, who will not have to set anything when writing its query.

In order to configure federated querying, you need to :
1. Declare the endpoint to which you want to send the federated queries, by creating an instance of `sd:Service`
2. Indicate the SPARQL endpoint URL of this service using the `sd:endpoint` property
3. Link *specific properties* in your configuration to this endpoint using the `core:sparqlService` annotation.

In the queries involving these specific properties, all the "branch" of the query using this property will automatically be surrounded with a `SERVICE` keyword.

We will illustrate this configuration with federated queries on Wikidata.


## Configuration in SHACL


1. Add a `http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlService` annotation on a property shape that is to be executed as a SERVICE
2. This annotation will point to an entity that itself is the subject of an `http://www.w3.org/ns/sparql-service-description#endpoint` predicate holding the actual SPARQL endpoint URL
3. Optionnaly you can add `http://data.sparna.fr/ontologies/sparnatural-config-core#executedAfter` on the property shape to force the rest of the query to be put in subquery that will be evalued before the SERVICE clause is sent


```turtle
PREFIX core: <http://data.sparna.fr/ontologies/sparnatural-config-core#>
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>

ex:myNodeShape a sh:NodeShape ;
  sh:property ex:myProperty .

ex:myProperty sh:path ex:myProperty ;
  # use custom annotation to link the property to the SPARQL service
  # the SPARQL service indicates its endpoint with the sd:endpoint property
  core:sparqlService [sd:endpoint <https://vocab.getty.edu/sparql> ] ;
  # rdfs:label ...
  # the remote part of the query will be executed after the rest
  core:executedAfter true ;
.
```


## Configuration in OWL

### The short, simple, Turtle way

If you edit the configuration in Turtle, a configuration could like this:

```turtle
PREFIX core: <http://data.sparna.fr/ontologies/sparnatural-config-core#>
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
ex:myProperty owl:subPropertyOf core:NonSelectableProperty ;
  # use custom annotation to link the property to the SPARQL service
  # the SPARQL service indicates its endpoint with the sd:endpoint property
  core:sparqlService [sd:endpoint <https://vocab.getty.edu/sparql> ] ;
  # rdfs:label ...
.
```

### Configuring in Protégé

#### Declare an instance of sd:Service

`sd:Service` is a class declared in the [SPARQL Service Description](https://www.w3.org/TR/sparql11-service-description/#sd-Service) vocabulary. It is included for you in the Sparnatural configuration ontology, so you don't have to add an import.

In Protégé, create an instance of that class, and give it the URI you want, for example `https://www.wikidata.org` :

![](assets/images/protege-screenshot-service-instance-creation.png)

#### Declare the endpoint URL

While the Service URI can be anything you like, you need to formally declare the technical URL at which the service listens using the `sd:endpoint` property on this instance.

in Protégé you are force to first declare an instance of owl:Thing with the URL to be able to further select it (if you edit your configuration manually you don't need to do that).

Create an instance of owl:Thing and give it the precise URL of the SPARQL endpoint, in our case `https://query.wikidata.org/` :

![](assets/images/protege-screenshot-service-endpoint-creation.png)

Then come back to your Service individual, edit it and add an object property assertion with predicate `sd:endpoint` and value `https://query.wikidata.org/`. In Protégé you are forced to switch to first switch to "View > Render by prefixed name" in order to be able to select your endpoint URL:

![](assets/images/protege-screenshot-service-service-endpoint-edition.png)


#### Link a property to the service

Now that our service is ready, we can indicate that a property in our configuration should be routed to that Service. We do that with the `core:sparqlService` property. For example we could imagine that a property to fetch the geographic coordinates uses federation to fetch the geometry from Wikidata:

![](assets/images/protege-screenshot-service-sparqlService.png)

Note how:
- we select the service www.wikidata.org, not the URL https://query.wikidata.org
- Our property is mapped to `<http://www.wikidata.org/prop/direct/P625>` which is the property identifier in Wikidata holding geo coordinates

#### and... TADAM !

Now when a query is issued involving this property, it is automatically wrapped in a SERVICE clause using the endpoint URL:

![](assets/images/protege-screenshot-service-final-sparql.png)

### Additionnal (experimental) config : executedAfter

Some - if not most - of the federated query use-cases involve *first* querying the local triplestore, retrieve some URIs, and *then second* fetch some properties of these URIs in a remote federated triplestore. And not the reverse. For these kinds of query to be successfull, we need to instruct Sparnatural to execute first the local part of the query, and in a second time the remote part of the query. This involves wrapping the first part of the query in nested SELECT clause.

This can be achieved by setting an extra (experimental) flag `config:executedAfter` on the property:

```turtle
PREFIX core: <http://data.sparna.fr/ontologies/sparnatural-config-core#>
PREFIX sd: <http://www.w3.org/ns/sparql-service-description#>
ex:myProperty owl:subPropertyOf core:NonSelectableProperty ;
  # use custom annotation to link the property to the SPARQL service
  # the SPARQL service indicates its endpoint with the sd:endpoint property
  core:sparqlService [sd:endpoint <https://vocab.getty.edu/sparql> ] ;
  # the remote part of the query will be executed after the rest
  core:executedAfter true ;
  # rdfs:label ...
```

This way, the generated SPARQL query will look like this: (note the use of the inner SELECT):

![image](https://github.com/sparna-git/Sparnatural/assets/2728945/db87236e-0583-4418-b9ec-72a8e7fcc4d2)


```sparql
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
SELECT DISTINCT ?ProvidedCHO_1 ?ProvidedCHO_1_label WHERE {
  {
    SELECT * WHERE {
      ?ProvidedCHO_1 rdf:type <http://www.europeana.eu/schemas/edm/ProvidedCHO>.
      OPTIONAL {
        ?ProvidedCHO_1 (^<http://www.openarchives.org/ore/terms/proxyFor>/<http://purl.org/dc/elements/1.1/title>) ?ProvidedCHO_1_label.
        FILTER((LANG(?ProvidedCHO_1_label)) = "en")
      }
      ?ProvidedCHO_1 (^<http://www.openarchives.org/ore/terms/proxyFor>/<http://purl.org/dc/elements/1.1/type>) ?Type_2.
    }
  }
  SERVICE <https://vocab.getty.edu/sparql> {
    ?Type_2 (<http://www.w3.org/2004/02/skos/core#scopeNote>/rdf:value) ?ScopeNote_4.
    FILTER((LANG(?ScopeNote_4)) = "en")
  }
}
LIMIT 1000
```


## Joining on literal values

Sometimes the key to join between the local and the remote triplestore is a literal value. See the original discussion at [#605](https://github.com/sparna-git/Sparnatural/issues/605). In that case, the way to configure this in SHACL is the following:

1. Declare the property that contains in the local triplestore the key to join with the remote SPARQL service. Like _"lcsh id"_. 

```turtle
this:Museum a sh:NodeShape;
  sh:targetClass dbpedia:Museum;
  sh:nodeKind sh:IRI;
  rdfs:label "Museum"@en, "Musée"@fr;
  sh:property
    # the property expressing the literal value
   this:Museum_LCSH_id .

# The library of congress ID, A Literal
this:Museum_LCSH_id 
  sh:path dbpedia:fake_lcsh_id;
  sh:name "LCSH ID"@en, "LCSH ID"@fr;  
  sh:node this:LCSHIdentifier;
  dash:searchWidget core:NonSelectableProperty .
```

2. Declare a `sh:node` constraint on this property pointing to the entity in the config that "represents" these literal values, like _"LCSH Identifier"_


```turtle

# The library of congress ID, A Literal
this:Museum_LCSH_id 
  # points to a Literal NodeShape
  sh:node this:LCSHIdentifier .

# A Literal NodeShape
this:LCSHIdentifier a sh:NodeShape;
  # This represents literals
  sh:nodeKind sh:Literal;
  rdfs:label "Library of Congress Subject Headings ID"@en, "Library of Congress Subject Headings ID"@fr;
  # ...
.
```

3. Then attach a property on this literal entity, which represent how this same literal is expressed in the remote SPARQL service. This is counter intuitive, because literals normally cannot have properties, but this property will be an _inverse property_ **_from_** the remote entity **_to_** the literal. It is this property that will be annotated with the `core:sparqlService`. The property also uses an `sh:node` to declare its "range" entity, as usual.

Like this:

```turtle
# A Literal NodeShape
this:LCSHIdentifier a sh:NodeShape;
  # property attached to this literal
  sh:property this:Wikidata_hasLCSHIdentifier ;
.

# The property being an inverse and linking to the Wikidata item
# Note the use of inversePath
this:Wikidata_hasLCAuthorityIdentifier sh:path [ sh:inversePath wdt:P244 ] ;
  sh:name "is LC Authority ID of"@en, "is LC Authority ID of"@fr;
  sh:nodeKind sh:IRI;
  sh:node this:MuseumWikidata;
  # This is using a SPARQL SERVICE keyword
  core:sparqlService <https://www.wikidata.org> .
```