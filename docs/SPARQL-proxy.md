_[Home](index.html) > SPARQL endpoint proxy_

# SPARQL endpoint proxy

## 2 problems : https:// and CORS

Sparnatural is a pure client-side library, and the SPARQL queries that are created with it are sent directly *from your browser* to the target endpoint. This means that a demo page containing the Sparnatural component loaded from server A can query a SPARQL endpoint deployed on server B. For security reasons this is not possible by default, unless server B (the SPARQL endpoint) has explicitely allowed the *"origins (domain, scheme, or port) other than its own from which a browser should permit loading resources."* This is called Cross Origin Resource Sharing, or CORS, and is better explained in details at https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS. CORS works by setting specific HTTP headers on server B (the SPARQL endpoint), typically `Access-Control-Allow-Origin: *` to allow CORS from any other origin. The problem is that the SPARQL endpoint that you want to query may not have set such headers, in which case you are stuck.

Sparnatural has a website and demo pages at [https://sparnatural.eu](https://sparnatural.eu) - please note the *s* in `https`. But some of the SPARQL endpoints published on the web are not accessible in https. For security reasons a browser will refuse to issue a query to a non-https server from a page served by the https protocol.





## The (temporary) workaround

This is a temporary workaround, do not use in production





`
