_[Home](index.html) > Querying specific named graphs_

# Query specific named graphs

## Use-case

Sometimes you need to restrict your query to one or more specific named graphs in your triplestore.


## How it works

This is supported through the SPARQL protocol itself, inside the SPARQL endpoint URL, by adding one or more `?default-graph-uri=...` parameters to the endpoint URL you provide to Sparnatural. (see the [query section of the SPARQL protocol](https://www.w3.org/TR/2013/REC-sparql11-protocol-20130321/#query-operation)). The URI of the named graph(s) needs to be URL-encoded.


## Configuring Sparnatural

To configure Sparnatural to query only specific named graphs

1. Build the URL of the SPARQL endpoint by appending one or more `?default-graph-uri=...` parameters to it
2. Provide this URL to the `endpoint` attribute of the `<spar-natural` component

Here is an example querying `https://data.myDomain.com/graph/1` and `https://data.myDomain.com/graph/2`

```html
<!-- Note how 2 SPARQL endpoints URL are provided, along with the URL of the catalog file -->
<spar-natural 
            src="..."
            endpoint="https://localhost:7200/repositories/myRepo?default-graph-uri=https%3A%2F%2Fdata.myDomain.com%2Fgraph%2F1&default-graph-uri=https%3A%2F%2Fdata.myDomain.com%2Fgraph%2F2"
            ... other attributes ...
></spar-natural>
```