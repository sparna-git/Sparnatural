_[Home](index.html) > Sparnatural form > form integration_

# Sparnatural Form integration and parameters reference

## Constructor

Sparnatural Form is inserted as custom HTML element named `sparnatural-form`, with specific attributes. It looks like so:

```html
  <sparnatural-form 
    src="sparnatural-config.ttl"
    form="form-specification.json"
    query="form-query.json"
    endpoint="https://dbpedia.org/sparql"
    lang="en"
    defaultLang="en"
    limit="1000"
    debug="true"
  />
```

## HTML attributes reference

In a nutshell, Sparnatural Form requires 4 things to be configured:

- A Sparnatural `query` structure that will be executed when the form is submitted. This query structure can be arbitrarily complicated, although the user will see only a flat and simple form.
- A `form` specification, that binds variables from the `query` to fields in the form. When the user selects a value for a certain field, the value is injected in the corresponding variable in the query.
- The `src` configuration giving the underlying structure of the knowledge graph and the Sparnatural configuration. In particular this will contain the widget configuration used in the form
- The `endpoint` against which the queries are executed.


| Attribute | Description | Default | Mandatory/Optional |
| --------- | ----------- | ------- | ------------------ |
| `src` | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) | `undefined` | Mandatory
| `endpoint` | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) | `undefined` | Mandatory
| `form` | URL of a JSON file giving the specification of the form fields, following the [form specification structure](form-configuration.md) | `undefined` | Mandatory
| `query` | URL of a JSON file giving the structure of the final query that the form will execute, with variables bounded to the values provided in the form. This file must follow the [Sparnatural form query structure](../Query-JSON-format.md) | `undefined` | Mandatory
| `catalog` | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) | none | Optional|
| `limit` | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) | `-1` | Optional|
| `lang` | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) `en` | Recommended |
| `defaultLang` | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) `en` | Recommended |
| `prefixes` | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) | `none` | Optional

## Sparnatural Form events

TODO

## Sparnatural Form element API