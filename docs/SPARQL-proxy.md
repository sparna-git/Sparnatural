_[Home](index.html) > SPARQL endpoint proxy_

# SPARQL endpoint proxy

## 2 problems : https:// and CORS

Sparnatural is a pure client-side library, and the SPARQL queries that are created with it are sent directly *from your browser* to the target endpoint. This means that a demo page containing the Sparnatural component loaded from server A can query a SPARQL endpoint deployed on server B. For security reasons this is not possible by default, unless server B (the SPARQL endpoint) has explicitely allowed the *"origins (domain, scheme, or port) other than its own from which a browser should permit loading resources."* This is called Cross Origin Resource Sharing, or CORS, and is better explained in details at https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS. CORS works by setting specific HTTP headers on server B (the SPARQL endpoint), typically `Access-Control-Allow-Origin: *` to allow CORS from any other origin. The problem is that the SPARQL endpoint that you want to query may not have set such headers, in which case you are stuck.

Sparnatural has a website and demo pages at [https://sparnatural.eu](https://sparnatural.eu) - please note the *s* in `https`. But some of the SPARQL endpoints published on the web are not accessible in https. For security reasons a browser will refuse to issue a query to a non-https server from a page served by the https protocol.

## The (temporary) workaround : a SPARQL proxy

To workaroung these 2 limitations, Sparnatural offers a SPARQL proxy, deployed on an https server, and enabling CORS requests. This proxy simply forwards the queries it receives to the target SPARQL endpoint. A query from server to server is not subject to the CORS limitation.

The proxy is available online at [https://proxy.sparnatural.eu/sparql-proxy](https://proxy.sparnatural.eu/sparql-proxy/).

Basically you need to provide a URL like **`https://proxy.sparnatural.eu/sparql-proxy/sparql?endpoint={your-encoded-sparql-endpoint-url}`**, for example `https://proxy.sparnatural.eu/sparql-proxy/sparql?endpoint=http%3A%2F%2Ffr.dbpedia.org%2Fsparql`. This complete URL is a SPARQL-compatible endpoint and is conformant with the SPARQL protocol (in particular it expects a `query` parameter containing the SPARQL query). This is the URL you can pass as a parameter to the sparnatural component.

The code for the SPARQL proxy is open source and available at [https://github.com/sparna-git/sparql-proxy](https://github.com/sparna-git/sparql-proxy)

## Do not use in production !

This is a temporary workaround, you should not rely on the online proxy for production services. In production scenario you should either:
1. Deploy the Sparnatural page on the same server as the SPARQL endpoint (if it is your SPARQL endpoint)
2. or : enable CORS on your SPARQL endpoint (if it is your SPARQL endpoint) (for example for GraphDB, see [the documentation](https://graphdb.ontotext.com/documentation/10.2/directories-and-config-properties.html?highlight=cors#workbench-properties), for Virtuoso see [this page](https://vos.openlinksw.com/owiki/wiki/VOS/VirtTipsAndTricksCORsEnableSPARQLURLs))
4. or : deploy and maintain your own proxy service (possibly dy deploying the sparql-proxy application).





`
