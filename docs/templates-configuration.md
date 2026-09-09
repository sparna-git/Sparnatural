_[Home](index.html) > Templates_

# Templates

## What are templates ?

Templates are a way to customize how the dropdown lists, autocomplete suggestions, and tree nodes are displayed. With templates, any arbitrary variable returned by the underlying SPARQL datasource can be displayed in a custom HTML template, such as an additional description, birth + death dates of persons, countries of places, etc.

Templates can be used:

In list widgets:

![Screenshot template list](/assets/images/templates/template-list.png)

In autocomplete widgets:

![Screenshot template autocomplete](/assets/images/templates/template-autocomplete.png)

In tree widgets:

![Screenshot template tree](/assets/images/templates/template-tree.png)


## How to use templates ?

In order to use templates, you need to do 3 steps:

### Step 1 : enrich the SPARQL query of the datasource with extra variables

It is the SPARQL datasource associated to the property in the configuration that is responsible for retrieving the extra information to be displayed in the template. You simply need to return extra columns, with arbitrary names, in addition to the mandatory ones (see the [datasource configuration documentation](datasources-configuration.md)).

Here is an example of a property configured with a datasource that returns an extra description:

```turtle
@prefix this: <https://data.mydomain.com/ontologies/sparnatural-config/> .

this:Place_type_list sh:path rico:hasOrHadPlaceType;
  sh:name "place type (list)"@en, "type de lieu (liste)"@fr;
  sh:nodeKind sh:IRI;
  sh:node this:PlaceType;
  dash:searchWidget core:ListProperty;
  datasources:datasource this:list_placetype_definition .

this:list_placetype_definition a datasources:SparqlDatasource;
  datasources:noSort "true"^^xsd:boolean ;
  datasources:queryString """
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri ?count ?description (CONCAT(STR(?theLabel), " (", STR(?count), ")") AS ?label) (STR(?theLabel) AS ?itemLabel) WHERE {
  {
    SELECT ?uri ?count ?theLabel WHERE {
      {
        SELECT DISTINCT ?uri (COUNT(?domain) AS ?count) WHERE {
          ?domain rdf:type $domain;
            $property ?uri.
          FILTER(ISIRI(?uri))
        }
        GROUP BY ?uri
      }
      ?uri skos:prefLabel ?theLabel.
      FILTER(((LANG(?theLabel)) = "") || ((LANG(?theLabel)) = $lang))
    }
    ORDER BY DESC (?count) (UCASE(?theLabel))
    LIMIT 500
  }
  OPTIONAL {
    ?uri skos:definition ?description.
    FILTER(((LANG(?description)) = "") || ((LANG(?description)) = $lang))
  }
}
ORDER BY DESC (?count) (UCASE(STR(?label)))
  """;
```

### Step 2 : write your templates

Sparnatural relies on [handlebars](https://handlebarsjs.com/) for writing templates. To write your templates, in line with handlebars recommendations, put them in inner `<script type="text/x-handlebars-template">` elements inside the `<spar-natural>` element, **with an id equal to the property shape in the config**. The widget will look for such a template, based on the property shape id, and use it if it finds one. Otherwise it will apply its default behavior.

Here is an example for providing a template corresponding to the above property shape (note how the id of the `<script>` element matches the URI of the property shape):

```html
  <spar-natural (...)>

    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_list"
      type="text/x-handlebars-template"
    >
      <div>
        here will be the template
      </div>
    </script>
  </spar-natural>
```

To write the content of the template, you design an HTML structure using [handlebars](https://handlebarsjs.com/), in which variables are inserted. Templates have access to all the variables of the SPARQL query inside a `bindings` object. The variables have the same structure as the [SPARQL query result format](https://www.w3.org/TR/sparql11-results-json/) (so with inner `value`, `xml:lang` or `datatype` fields). So to access the text of the variable `?description` from the SPARQL, you would write `{{bindings.description.value}}`.



```html
  <spar-natural (...)>

    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_list"
      type="text/x-handlebars-template"
    >
      <div>
        <b>{{#if itemLabel}}{{itemLabel}}{{else}}{{label}}{{/if}}</b>{{#if
          bindings.count
        }}
          <span
            class="item-count"
          >({{bindings.count.value}})</span>{{/if}}
        <a
          class="item-link"
          href="{{term.value}}"
          target="_blank"
          rel="noopener"
          title="Ouvrir {{term.value}} dans un nouvel onglet"
        ></a>
        {{#if bindings.description}}<br /><small
          >{{bindings.description.value}}</small>{{/if}}
      </div>
    </script>
  </spar-natural>
```

The template displays the label from the datasource, the count if available, an external clickable link to the URI, and below, inside a `<small>` element, a description, if available.

### Step 3 : apply custom CSS rules (optional)

The templates you write may contain arbitrary HTML code, including arbitrary CSS classes, on which you can then apply custom CSS rules.

Here is an example:

```html
  TODO
```


## Template examples

### Label + link + description

```html
  <spar-natural>
    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_autocomplete"
      type="text/x-handlebars-template"
    >
      <div>
        <b>{{label}}</b>
        <a
          class="item-link"
          href="{{term.value}}"
          target="_blank"
          rel="noopener"
          title="Ouvrir {{term.value}} dans un nouvel onglet"
        ></a>
        {{#if bindings.description}}<br /><small
          >{{bindings.description.value}}</small>{{/if}}
      </div>
    </script>
  </spar-natural>
```

### Label + count + link + description

```html
  <spar-natural>
    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_list"
      type="text/x-handlebars-template"
    >
      <div>
        <b>{{#if itemLabel}}{{itemLabel}}{{else}}{{label}}{{/if}}</b>{{#if
          bindings.count
        }}
          <span
            class="item-count"
          >({{bindings.count.value}})</span>{{/if}}
        <a
          class="item-link"
          href="{{term.value}}"
          target="_blank"
          rel="noopener"
          title="Ouvrir {{term.value}} dans un nouvel onglet"
        ></a>
        {{#if bindings.description}}<br /><small
          >{{bindings.description.value}}</small>{{/if}}
      </div>
    </script>
  </spar-natural>
```