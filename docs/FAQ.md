_[Home](index.html) > FAQ_

# Frequently Asked Questions

## Configuration


#### How do I setup a search on dates ?

...

Originally asked in [issue 314](https://github.com/sparna-git/Sparnatural/issues/314).


#### How do I search in the inverse direction ?

...

Originally asked in [issue 317](https://github.com/sparna-git/Sparnatural/issues/317).


#### How do I setup a search on a text field ?

...

Originally asked in [issue 309](https://github.com/sparna-git/Sparnatural/issues/309).


#### How do I map a class to more than one target class ?

...

Originally asked in [issue 318](https://github.com/sparna-git/Sparnatural/issues/318).


#### How do I set nice prefixes in the output SPARQL query ? can I use prefixed values in the sparqlString annotation ?

This is currently not possible, avoid use prefixes in sparqlString.

See also [Sparnatural Wikidata Prototype](https://github.com/lubianat/sparnatural_wikidata_prototype/pull/4).

#### How do I setup Sparnatural on Wikidata ?

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

...

See [issue 3 in Sparnatural Wikidata Prototype](https://github.com/lubianat/sparnatural_wikidata_prototype/issues/3).


#### The default datasources use `langMatches()` function and returns dupicate languages, can this be changed to `lang()` instead ?

You need to create a custom datasource with a custom SPARQL query to do that. See https://docs.sparnatural.eu/datasources-configuration#your-own-sparql-query-lists--autocomplete and see an example at https://github.com/sparna-git/sparnatural.eu/blob/main/demos/demo-smt-cim10/sparnatural-config.ttl#L117


Originally asked in [issue 327](https://github.com/sparna-git/Sparnatural/issues/327).
