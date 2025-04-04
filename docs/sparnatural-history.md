_[Home](index.html) > Sparnatural history_


# Sparnatural history Javascript integration


## Constructor

Sparnatural history is inserted ...

```html
  <sparnatural-form 
    
  />
```

## HTML attributes reference

| Attribute | Description | Default | Mandatory/Optional |
| --------- | ----------- | ------- | ------------------ |
| `src` | Provides the configuration that specifies the classes and properties to be displayed, and how they are mapped to SPARQL. This can be either the URL of a SHACL or OWL file, in Turtle or RDF/XML. Example : `sparnatural-config.ttl`. Another option is to provide a serialized JSON obj as a string. For example: `JSON.stringify(configAsJsonObj)`. It is possible to pass **multiple** URLs be separating them with a whitespace, e.g. `sparnatural-config.ttl statistics.ttl`  | `undefined` | Mandatory
| `endpoint` | The URL of a SPARQL endpoint that will be used as the default service for the datasource queries provided in the configuration. If not specified, each datasource should indicate explicitely a SPARQL endpoint. Note that this URL can use the `default-graph-uri` parameter to restrict the query to a specified named graph, as per [SPARQL protocol specification](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#dataset), e.g. `http://ex.com/sparql?default-graph-uri=http%3A%2F%2Fencoded-named-graph-uri`. This can also contain **multiple** endpoint URLs in combination with the `catalog` attribute (see "[querying multiple endpoints](Querying-multiple-endpoints.md)") | `undefined` | Mandatory except for advanced use-cases. |


## Sparnatural history events

...

```javascript
  // ...
```


### "xxx" event



## Sparnatural history element API

The table below summarizes the various functions that can be called on the Sparnatural history element.

| Function | Description | Parameters |
| -------- | ----------- | ---------- |
| `sparnatural.enablePlayBtn()` | Removes the loading from the play button once a query has finished executing.  | none |
