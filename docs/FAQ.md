_[Home](index.html) > FAQ_

# Frequently Asked Questions

## Configuration


#### How do I setup a search on dates ?

By default, properties with an `sh:datatype` of `xsd:date` or `xsd:dateTime` or `xsd:gYear` will have a [calendar widget](https://docs.sparnatural.eu/widgets.html#date-range-widget). You can explicitely set this calendar widget by annotating the property shape with `config-core:TimeProperty-Date` as the `dash:propertyRole`, e.g.:

```turtle
ex:Person
    a sh:NodeShape ;
    sh:property [
        sh:path foaf:birthDate ;
        sh:name "birth date"@en ;
        dash:propertyRole config-core:TimeProperty-Date ;
    ]
.
```

There is also a [special sort of search on dates](https://docs.sparnatural.eu/Querying-date-ranges.html), when the searched entities can express either a start + end date, or an exact date. Sparnatural is able to generate multiple UNION clauses automatically to deal with this situation. 

For legacy OWL configuration, see [issue 314](https://github.com/sparna-git/Sparnatural/issues/314).


#### How do I search in the inverse direction ?

Use a SHACL inverse property path, e.g.

```turtle
ex:MyPropertyShape
    sh:path [ sh:inversePath dcterms:subject ] ;
    sh:name "is subject of"@en ;
.
```

#### I need to setup inverse properties, but this introduces a cycle in my SHACL, how to deal with this ?

Here is an example of a cycle where 2 NodeShapes refer to each other by `sh:node` in their property shapes:

```turtle
ex:Group
    a sh:NodeShape ;
    sh:property [
        sh:path foaf:member ;
        sh:name "has member"@en ;
        sh:node ex:Person ;
    ]
.

ex:Person
    a sh:NodeShape ;
    sh:property [
        sh:path [ sh:inversePath foaf:member ] ;
        sh:name "is member of"@en ;
        sh:node ex:Group ;
    ]
.
```

Cycles in SHACL are not a problem for Sparnatural, but they prevent SHACL validators to properly validate data. You have 2 options:
    - break the cycle by changing `sh:node` to `sh:class` and refer to the class that is the `sh:targetClass` of the other shape. This works only if one of your shape uses `sh:targetClass`, which is not always the case.
    - create 2 SHACL files : one base SHACL file for validation only, and an extension of it specifically for Sparnatural. Remove the inverse property from the base SHACL, and put in the Sparnatural-specific extension. Then pass both SHACL file to sparnatural in the `src` attribute, e.g. `<spar-natural src="shacl-base.ttl shacl-extension.ttl"`. This way the validator can work and Sparnatural can show the inverse path.


#### How do I setup a search on a text field ?

1. Declare a NodeShape that represents your literal values, with an `sh:nodeKind` equal to `sh:Literal`. You will use it as the range of your field:

```turtle
ex:TextValue
    a sh:NodeShape ;
    sh:nodeKind sh:Literal ;
    rdfs:label "Text"@en ;
.
```

Use it as the range of your text field, with a `config:SearchProperty` widget:

```turtle
ex:Museum
    a sh:NodeShape ;
    sh:property [
        sh:path dcterms:description ;
        sh:node ex:TextValue ;
        dash:searchWidget config:SearchProperty ;
        # redundant
        # sh:nodeKind sh:Literal ;
        sh:name "description"@en ;
    ];
.
```


For legacy OWL config, see [issue 309](https://github.com/sparna-git/Sparnatural/issues/309).


#### How do I map a class to more than one target class ?

You can declare multiple `sh:targetClass` on a NodeShape, or you can use a SPARQL target with a `$this` variable:

```turtle
ex:Organization
    sh:targetClass foaf:Group, foaf:Organization ;
.

ex:Adult
    sh:target [
        sh:select """
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            SELECT $this
            WHERE {
                $this a foaf:Person .
                $this foaf:age ?age .
                FILTER(?age > 18) .
            }
        """;
    ] ;
```

For legacy OWL config, see [issue 318](https://github.com/sparna-git/Sparnatural/issues/318).


#### How do I set nice prefixes in the output SPARQL query ?

Declare the prefixes attribute of the `<spar-natural` element, see the [HTML integration documentation](https://docs.sparnatural.eu/Javascript-integration.html#html-attributes-reference).

#### How do I setup Sparnatural on Wikidata ?

This is very experimental.

See [Sparnatural Wikidata Prototype](https://github.com/lubianat/sparnatural_wikidata_prototype).

- Set the target SPARQL endpoint to `https://query.wikidata.org/sparql`
- Use `typePredicate` config option with a value of `http://www.wikidata.org/prop/direct/P31`
- You can configure a custom autocomplete query with a queryString like the following:

```
SELECT DISTINCT ?uri ?label
WHERE {
    ?domain <http://www.wikidata.org/prop/direct/P31>  $domain .
    ?domain $property ?uri .
    ?uri rdfs:label ?label .
    FILTER(isIRI(?uri))
    FILTER(lang(?label) = \"\" || lang(?label) = $lang)
    FILTER(CONTAINS(LCASE(STR(?label)), LCASE(\"$key\")))
}
ORDER BY UCASE(?label)
LIMIT 50
```

- Dropdown lists currently don't work properly due to Wikidata query service being too slow


#### How do I automatically get a label to display when the user clicks on the "eye" ?

You should annotate the property shape corresponding to the human-readable of the entity with `dash:propertyRole` and the value `dash:LabelRole`. This property can be marked `sh:deactivated` if you don't want the users to search on it;

```turtle
ex:Museum
    a sh:NodeShape ;
    sh:property [
        sh:path rdfs:label ;
        # this is the human-readable label for Museums
        dash:propertyRole dash:LabelRole ;
        # this won't show up as a search field
        sh:deactivated true ;
    ];
.
```

#### The default datasources use `langMatches()` function and returns dupicate languages, can this be changed to `lang()` instead ?

You need to create a custom datasource with a custom SPARQL query to do that. See https://docs.sparnatural.eu/datasources-configuration#your-own-sparql-query-lists--autocomplete and see an example at https://github.com/sparna-git/sparnatural.eu/blob/main/demos/demo-smt-cim10/sparnatural-config.ttl#L117


Originally asked in [issue 327](https://github.com/sparna-git/Sparnatural/issues/327).
