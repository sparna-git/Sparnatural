_[Accueil](/fr) > Configuration OWL_

# Configurer Sparnatural en OWL

Sparnatural peut être configuré en utilisant un fichier OWL édité dans [Protégé](http://protege.stanford.edu) et sauvegardé dans le format Turtle.

Sparnatural peut également être configuré au moyen d'une [[JSON-based configuration]], but OWL-based configuration brings:
- an editing environement (Protégé);
- formal machine-readable links from Sparnatural configuration to business ontology;
- sharing, publishing and reusing configurations;
- hosting configuration in different (CORS-enabled) servers than where Sparnatural is deployed;

This documentation assumes you are familiar with Protégé.

## Sparnatural configuration ontologies

Sparnatural comes with 2 ontologies that need to be imported (through `owl:imports`) in your own configuration ontology:
1. A core configuration ontology at http://data.sparna.fr/ontologies/sparnatural-config-core
2. A datasource configuration ontology at http://data.sparna.fr/ontologies/sparnatural-config-datasources

## How to define and test your own configuration ?

1. Create a new ontology in Protégé;
2. Import the 2 Sparnatural configuration in your ontology;
3. Specify your configuration (see below);
4. Save your ontology preferably in Turtle, or in RDF/XML, but NOT in an OWL-specific serialisation (such as OWL/XML);
5. Configure a test HTML page where Sparnatural is installed (you can clone [one the demo page of the sparnatural.eu website](https://github.com/sparna-git/sparnatural.eu)) and change the URL of the SPARQL service to be queried, and the path to your configuration file.
     1. You can test with a local GraphDB repository by providing the URL of the repository : http://localhost:7200/repositories/{repositoryName}
     1. If necessary (may not be mandatory for latest GraphDB version), make sure GraphDB is CORS-enabled and is launched with the flag **graphdb.workbench.cors.enable** (see the [GraphDB documentation page](https://graphdb.ontotext.com/documentation/standard/workbench-user-interface.html))
6. To test your configuration locally, provide the relative path to the configuration file in Sparnatural Javascript initialization, and make sure your browser is CORS-enabled for local files.
    1. To make Firefox CORS-enables for local files :
        1. Open Firefox
        1. Type "about:config" in the address bar
        1. Accept security warning
        1. Search for the config **security.fileuri.strict_origin_policy**
        1. Set this config to "false"
    1. To make Chrome / Chromium CORS-enabled for local files :
        1. Close Chrome
        2. Open a command-line or a terminal
        3. Run chrome with the flag "**--allow-file-access-from-files**", e.g. on Ubuntu Linux "chromium --allow-file-access-from-files"

## How to publish your configuration

1. If your configuration is hosted on the same server as the Sparnatural component, there is nothing special to do, just put the configuration ontology in a file typically in the same folder as the HTML page in which Sparnatural is used.
2. If the configuration is not on the same server as the page in which Sparnatural is inserted, it must be [CORS-enabled](https://enable-cors.org/); an easy way to do this is to host it in a Github repository or Gist;
3. Provide the URL to your configuration ontology in Sparnatural configuration. For a file hosted on Github, this must be the "raw" link to the file, that is the link returning the turtle file, e.g. https://raw.githubusercontent.com/sparna-git/Sparnatural/master/demos/sparnatural-demo-semapps/sparnatural-config-semapps-meetup.ttl

## Reference for classes and properties of a Sparnatural configuration

### Namespaces

| Prefix | Namespaces |
| ------ | ---------- |
| core   | http://data.sparna.fr/ontologies/sparnatural-config-core# |
| ds     | http://data.sparna.fr/ontologies/sparnatural-config-datasources# |

### Classes configuration reference

| Annotation / Axiom | Label | Card. | Description |
| ------------------ | ----- | ----- | ----------- |
| `rdfs:subClassOf` [`core:SparnaturalClass`](http://data.sparna.fr/ontologies/sparnatural-config-core#SparnaturalClass) | subclass of Sparnatural class | 1..1 | Each class in the configuration must be declared subclass of core:SparnaturalClass |
| `rdfs:label` | class display label | 1..* | The display label of the class in Sparnatural class selection lists. Each label can be associated to a language code. Sparnatural will choose the appropriate label depending on its language config parameter. Sparnatural defaults to a label with no language if no label in configured language can be found. |
| [`core:faIcon`](http://data.sparna.fr/ontologies/sparnatural-config-core#faIcon) | fontawesome icon code | 0..1 | The code of a Font Awesome icon to be displayed next to the class label, e.g. `fas fa-user` or `fad fa-male`. If you use this, don't specify `core:icon` or `core:highlightedIcon` |
| [`core:icon`](http://data.sparna.fr/ontologies/sparnatural-config-core#icon) | icon image URL | 0..1 | URL of a normal (black) icon to be displayed next to the class label. |
| [`core:highlightedIcon`](http://data.sparna.fr/ontologies/sparnatural-config-core#highlightedIcon) | highlighted icon image URL | 0..1 | URL of a highlighted (white) icon to be displayed next to the class label, when hovered. |
| [`core:sparqlString`](http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString) | SPARQL String | 0..1 | The character string that will be inserted in SPARQL queries in place of the URI of this class. If this is not specified, the URI of the class is inserted. Do not use prefixes, use full URIs. The character string can be any piece of valid SPARQL, so it MUST use `<` and `>`, e.g. "`<http://dbpedia.org/ontology/Person>`". To restrict to a specific SKOS ConceptScheme use `skos:Concept; [ skos:inScheme <http://exemple.fr/MyScheme> ]` |
| `rdfs:subClassOf` [`rdfs:Literal`](http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#http://www.w3.org/2000/01/rdf-schema#Literal) | subclass of Literal | 0..1 | For classes that correspond either to a Literal (typically a date), either to a search, set the class as subclass of `rdfs:Literal`. 1. No rdf:type criteria corresponding to this class will be put in SPARQL queries 2. The class will never appear in the initial class list 3. it will not be possible to traverse this class with WHERE clauses |
| `rdfs:subClassOf` [`core:NotInstantiatedClass`](http://data.sparna.fr/ontologies/sparnatural-config-core/index-en.html#NotInstantiatedClass) | subclass of NotInstantiatedClass | 0..1 | For classes that are references to "external" URIs that are not themselves described in the graph (i.e. they are not the subject of any triples in the graph, in particular no rdf:type), set the class as subclass of `core:NotInstantiatedClass`. 1. No rdf:type criteria corresponding to this class will be put in SPARQL queries 2. The class will never appear in the initial class list. It can still be used to be traversed in WHERE clause |
| [`core:order`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#order) | order | 0..1 | Order of this class in classes lists. If not set, alphabetical order is used. |
| [`core:tooltip`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tooltip) | tooltip | 0..n | Text that appears as tooltip when hovering this class, in lists and when selected. Multiple values are allowed in different languages. HTML markup is supported. |

### Properties configuration reference

| Annotation / Axiom | Label | Card. | Description |
| ------------------ | ----- | ----- | ----------- |
| `rdfs:subPropertyOf` | subproperty of | 1..1 | Each property must have a superperproperty that corresponds to its widget type (list, search field, date picker, etc.). Typical values are [`core:ListProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty) for a list, [`core:SearchProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#SearchProperty) for a search with autocomplete, [`core:NonSelectableProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#NonSelectableProperty) for no selection widget. See [the configuration ontology documentation](http://data.sparna.fr/ontologies/sparnatural-config-core) for all values. |
| `rdfs:label` | property display label | 1..* | The display label of the property in Sparnatural properties selection lists. Each label can be associated to a language code. Sparnatural will choose the appropriate label depending on its language config parameter. Sparnatural defaults to a label with no language if no label in configured language can be found. |
| `rdfs:domain` | property domain | 1..1 | The domain of the property, i.e. the classes "on the right" in Sparnatural, for which the property can be selected. Unions of classes are supported in case the property can apply to multiple classes (in Protégé : "Person or Company or Association").|
| `rdfs:range` | property range | 1..1 | The range of the property, i.e. the classes "on the left" in Sparnatural, to which the property can point. Unions of classes are supported in case the property can refer to multiple classes (in Protégé : "Person or Company or Association") |
| [`core:sparqlString`](http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString) | SPARQL Property or property path | 0..1 | The property or property path that will be inserted in SPARQL queries in place of the URI of this property. If this is not specified, the URI of the property is inserted. Do not use prefixes, use full URIs. The character string can be any valid property path, so it MUST use `<` and `>` around IRIs, e.g. "`<http://dbpedia.org/ontology/birthPlace>`". You can use `^` for inverse path `/` for sequence paths, `(...)` for grouping, `\|` for alternatives. Exemples: `<http://dbpedia.org/ontology/author>` (simple single property mapping), `^<http://dbpedia.org/ontology/museum>` (reverse path), `<http://dbpedia.org/ontology/birthPlace>/<http://dbpedia.org/ontology/country>` (sequence path), `^(<http://dbpedia.org/ontology/birthPlace>/<http://dbpedia.org/ontology/country>)` (reverse sequence path) |
| [`ds:datasource`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#datasource) | property datasource | 0..1 | Applicable to properties under `SelectResourceProperty` (typically list and autocomplete). The datasource to use for the property. The datasource will specify how to populate the list or how to return the autocomplete proposals. List properties must use a list datasource, autocomplete properties must use a search datasource. |
| [`core:enableNegation`](http://data.sparna.fr/ontologies/sparnatural-config-core#enableNegation) | enable negation | 0..1 | Enables the additional option to express a negation (using a `FILTER NOT EXISTS`) on this property. The `FILTER NOT EXISTS` will apply to the whole "branch" in the query (this criteria and all children criterias) |
| [`core:enableOptional`](http://data.sparna.fr/ontologies/sparnatural-config-core#enableOptional) | enable optional | 0..1 | Enables the additional option to express an `OPTIONAL` on this property. The `OPTIONAL` will apply to the whole "branch" in the query (this criteria and all children criterias) |
| [`core:isMultilingual`](http://data.sparna.fr/ontologies/sparnatural-config-core#isMultilingual) | is optional | 0..1 | used to indicate that the values of the property are multilingual (in other words, that there are multiple values with different language tags). In this case, when the value of such a property is selected as a column, a FILTER will automatically be added to filter the value based on the default language of Sparnatural (passed as a parameter at init) |
| [`core:order`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#order) | order | 0..1 | Order of this property in property lists. If not set, alphabetical order is used. |
| [`core:tooltip`](http://data.sparna.fr/ontologies/sparnatural-config-datasources#tooltip) | tooltip | 0..n | Text that appears as tooltip when hovering this property, in lists and when selected. Multiple values are allowed in different languages. HTML markup is supported. |