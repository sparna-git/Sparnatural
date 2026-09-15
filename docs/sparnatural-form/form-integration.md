_[Home](../index.html) > Sparnatural form > form integration_

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

| Attribute       | Description                                                                                                                                                                                                                                                            | Default     | Mandatory/Optional |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------- | ------------------ |
| `src`           | identical to the equivalent [Sparnatural attribute](../javascript-integration.md)                                                                                                                                                                                      | `undefined` | Mandatory          |
| `endpoint`      | identical to the equivalent [Sparnatural attribute](../javascript-integration.md)                                                                                                                                                                                      | `undefined` | Mandatory          |
| `form`          | URL of a JSON file giving the specification of the form fields, following the [form specification structure](form-configuration.md)                                                                                                                                    | `undefined` | Mandatory          |
| `query`         | URL of a JSON file giving the structure of the final query that the form will execute, with variables bounded to the values provided in the form. This file follows the [v12 Sparnatural query structure](../archives/Query-JSON-format-v12.md) (`branches` / `line`). | `undefined` | Mandatory          |
| `catalog`       | identical to the equivalent [Sparnatural attribute](../javascript-integration.md)                                                                                                                                                                                      | none        | Optional           |
| `defaultLang`   | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) `en`                                                                                                                                                                                 | Recommended |
| `lang`          | identical to the equivalent [Sparnatural attribute](../javascript-integration.md) `en`                                                                                                                                                                                 | Recommended |
| `limit`         | identical to the equivalent [Sparnatural attribute](../javascript-integration.md)                                                                                                                                                                                      | `-1`        | Optional           |
| `prefixes`      | identical to the equivalent [Sparnatural attribute](../javascript-integration.md)                                                                                                                                                                                      | `none`      | Optional           |
| `typePredicate` | The type predicate to use to generate the type criteria. Defaults to rdf:type, but could be changed to e.g. `<http://www.wikidata.org/prop/direct/P31>+` for Wikidata integration, or `<http://www.w3.org/2000/01/rdf-schema#subClassOf>+` to query OWL-style models.  | `rdf:type`  | Optional           |

## Sparnatural Form events

### "queryUpdated" event

The `queryUpdated` event is triggered everytime the query is modified. The event detail contains :

- The SPARQL string in `queryString`
- The JSON Sparnatural structure in queryJson

```javascript
sparnaturalForm.addEventListener("queryUpdated", (event) => {
  console.log(event.detail.queryString);
  console.log(event.detail.queryJson);
});
```

### "submit" event

The `submit` event is triggered when the search/export button is clicked.

In typical integrations, the state of the submit button can be updated upon submit. The submit button can be “not loading and active”, “loading” or “disabled”. The functions to update the state of the button are:

- `sparnaturalForm.disablePlayBtn()`
- `sparnaturalForm.enablePlayBtn()`

`disablePlayBtn()` should be called on submit event and `enablePlayBtn()` when the query has returned.

### "init" event

The `init` event is triggered when Sparnatural form has finished initializing itself.

See the [corresponding event in Sparnatural](../Javascript-integration.html#init-event).

### "reset" event

The `submit` event is triggered when the reset button is clicked. It can be used to empty or reset other part of the page, typically YasQE.

See the [corresponding event in Sparnatural](../Javascript-integration.html#reset-event).

## Pre-filling the form

Sparnatural form can be pre-filled when the page loads, in two independent ways.

**From the page URL.** `<sparnatural-form>` does this on its own, no extra element required : a link such as `?Title=Carmen&Saison=2020` opens the form with those fields filled (including fields holding several values) and submits the search automatically. See [Prefilling with URL parameters or a JSON query](form-prefill.md) for the syntax of every parameter.

**From a dropdown of predefined example queries.** This one is provided by the `<sparnatural-form-queries>` web component, bound to a form through its `for` attribute :

```html
<sparnatural-form-queries
  src="predefined-queries.json"
  lang="en"
  for="my-form"
></sparnatural-form-queries>

<sparnatural-form id="my-form" ...></sparnatural-form>
```

Add it only when you have a queries file to offer. See the [Predefined queries dropdown](form-predefined-queries.md) page for the full reference.

## Sparnatural Form element API

TODO
