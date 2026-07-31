_[Home](index.html) > Sparnatural form > form pre-filling_

# Pre-filling a Sparnatural form

Sparnatural form can be **pre-filled** when the page loads, so that the form opens with some fields already populated. This is useful to :

- share a link that opens the form with a ready-made search (URL parameters) and runs it automatically ;
- offer the user a list of ready-made example queries in a dropdown (predefined queries).

Both features are provided by the **`<sparnatural-form-queries>`** web component. You add it to your page next to the `<sparnatural-form>` it drives, and it takes care of everything :

- it pre-fills the target form from the page URL and **submits it automatically** (see [Pre-filling from the URL](#pre-filling-from-the-url) and [Auto-submit after URL pre-filling](#auto-submit-after-url-pre-filling)) ;
- if you give it a `src`, it also renders a [dropdown of predefined queries](#predefined-queries-dropdown).

## The `<sparnatural-form-queries>` component

```html
<sparnatural-form-queries
  src="path/to/predefined-queries.json"
  lang="en"
  for="my-form"
></sparnatural-form-queries>

<sparnatural-form
  id="my-form"
  src="sparnatural-config.ttl"
  form="form-specification.json"
  query="form-query.json"
  endpoint="https://example.org/sparql"
></sparnatural-form>
```

As soon as the target form has finished initializing, the component reads the page URL, pre-fills the form and submits it. It is rendered **outside** the `sparnatural-form` element, so you can position and style it independently of the form.

### Attributes

| Attribute | Description                                                                                                                                                                                 | Default             |
| --------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------- |
| `for`     | `id` of the target `<sparnatural-form>`. If omitted, the single form on the page is used.                                                                                                   | single form on page |
| `src`     | URL of the predefined queries JSON file (see [Predefined queries dropdown](#predefined-queries-dropdown)). **Optional** : without it, no dropdown is shown, but URL pre-filling still runs. | none (no dropdown)  |
| `lang`    | Dropdown language, applied to the placeholder and to the [per-language query labels](#predefined-queries-file-format).                                                                      | `en`                |

The component resolves its target form even if it is declared **before** that form in the HTML : if the `for` target is not in the DOM yet, it is looked up again once the document has finished parsing.

There are **two ways** to pre-fill the form from the URL :

- passing a **full JSON query** in a single `query` parameter, using the same structure as the predefined queries (the display label is part of the query) ;
- passing **one raw value per variable**, in a simpler and cleaner URL, where display labels are resolved automatically.

If a `query` parameter is present, it takes precedence and the per-variable parameters are ignored. The `lang` and `exec` parameters are reserved (they are page-level, never form fields).

## Pre-filling from a full JSON query

The most complete way to pre-fill the form is to pass a full query structure in the `query` URL parameter. The value is a JSON object mapping each form variable to a labelled criteria — the same structure the predefined-queries dropdown uses :

```json
{
  "RepresentationType": {
    "label": "acoustic",
    "criteria": {
      "rdfTerm": {
        "type": "uri",
        "value": "http://vocab.performing-arts.ch/rtac"
      }
    }
  },
  "UniqueIDValue": {
    "label": "1067",
    "criteria": { "search": "1067" }
  }
}
```

This JSON must be **URL-encoded** and passed as the `query` parameter :

```
https://example.org/search?query=%7B%22RepresentationType%22%3A%7B%22label%22%3A%22acoustic%22%2C%22criteria%22%3A%7B%22rdfTerm%22%3A%7B%22type%22%3A%22uri%22%2C%22value%22%3A%22http%3A%2F%2Fvocab.performing-arts.ch%2Frtac%22%7D%7D%7D%2C%22UniqueIDValue%22%3A%7B%22label%22%3A%221067%22%2C%22criteria%22%3A%7B%22search%22%3A%221067%22%7D%7D%7D
```

If an invalid JSON is passed, an error is logged in the console and no pre-fill happens.

## Pre-filling from the URL

Instead of a single `query` parameter, every URL query parameter (except the reserved `lang` and `exec`) is interpreted as a **form field to pre-fill**. The parameter **name** is the `variable` of the field, as declared in the [form specification](form-configuration.md), and the parameter **value** is the value to inject. This gives a cleaner, easier-to-build URL, at the cost of resolving labels automatically.

For example, with a form that declares the variables `Title` and `Season` :

```
https://example.org/search?Title=Carmen&Season=2020
```

opens the form with the `Title` field filled with `Carmen` and the `Season` field filled with `2020`.

You can pass as many parameters as you want ; a parameter whose name does not match any form variable is simply ignored (a warning is logged in the console).

The parameter name is matched against the form variables **case-insensitively** : `?title=Carmen` and `?TITLE=Carmen` both fill the `Title` field. An exact match always wins over a case-insensitive one.

### Special values : "Unknown" and "Any known value"

Two reserved keywords let you pre-select the _"Unknown"_ and _"Any known value"_ options of a field from the URL, instead of an actual value :

| Keyword   | Effect                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `UNKNOWN` | Ticks the field's **"Unknown"** option (the value must not exist — a `FILTER NOT EXISTS` in SPARQL). |
| `ANY`     | Ticks the field's **"Any known value"** option (the value can be anything, as long as it exists).    |

Both keywords are **case-insensitive** (`UNKNOWN`, `unknown` and `Unknown` all work). For example :

```
https://example.org/search?Season=UNKNOWN
```

opens the form with the `Season` field set to _"Unknown"_.

These options only exist on fields that are declared as optional in the query structure. If a field has no such option, the keyword is ignored and a warning is logged in the console.

### Passing several values to a single field

Some fields are configured to accept **more than one value** (multi-value). To pre-fill such a field with several values from the URL, **repeat the parameter** :

```
https://example.org/search?TypeActor=http%3A%2F%2Fexample.org%2FActor&TypeActor=http%3A%2F%2Fexample.org%2FGroup
```

This opens the form with the `TypeActor` field holding both values, `Actor` and `Group`.

Each repeated value is interpreted individually (a URI is resolved to its label, a literal is parsed by the widget). If the field is configured to accept only **one** value, the extra values are ignored and a warning is shown next to the field ; values are only stacked on multi-value fields.

### Auto-submit after URL pre-filling

When the form is pre-filled from the URL, it is **submitted automatically** once the pre-filling is complete, so that a shared link directly shows the results without the user having to click the search button.

To pre-fill the form **without** submitting it (for instance to let the user review or adjust the criteria first), add `exec=false` to the URL :

```
https://example.org/search?Title=Carmen&Season=2020&exec=false
```

Any other value of `exec` (or its absence) keeps the default behaviour and submits the form.

> Auto-submit only applies to **URL** pre-filling. Selecting an entry in the [predefined-queries dropdown](#predefined-queries-dropdown) pre-fills the form but does **not** submit it — the user triggers the search themselves.

## Predefined queries dropdown

When the component is given a `src`, it displays a dropdown listing ready-made example queries. When the user picks one, the form is pre-filled with its values (the form is **not** submitted — the user runs the search themselves).

### Predefined queries file format

The `src` file is a JSON object with a single `queries` array. Each entry has a `label` (the text shown in the dropdown) and a `values` object using the same structure as a [full JSON query](#pre-filling-from-a-full-json-query) — a mapping from a form variable to a labelled criteria.

A `label` can be an object with one entry per language, or a simple string. When it is an object, the [`lang`](#attributes) attribute picks the language. In the example below, the first query uses a per-language label and the second a simple string :

```json
{
  "queries": [
    {
      "label": { "fr": "Productions", "en": "Productions" },
      "values": {
        "Activity_Type": {
          "label": "production",
          "criteria": {
            "rdfTerm": {
              "type": "uri",
              "value": "http://vocab.example.org/production"
            }
          }
        }
      }
    },
    {
      "label": "Productions of the 2020 season",
      "values": {
        "Activity_Type": {
          "label": "production",
          "criteria": {
            "rdfTerm": {
              "type": "uri",
              "value": "http://vocab.example.org/production"
            }
          }
        },
        "Season": {
          "label": "2020",
          "criteria": { "search": "2020" }
        }
      }
    }
  ]
}
```

## Several forms on the same page

A single page can host several independent `<sparnatural-form>` elements, each with its own pre-filling. Give every form an `id`, and add one `<sparnatural-form-queries>` per form, each pointing at its form through `for` :

```html
<sparnatural-form-queries
  src="queries-a.json"
  for="form-a"
></sparnatural-form-queries>
<sparnatural-form id="form-a" ...></sparnatural-form>

<sparnatural-form-queries
  src="queries-b.json"
  for="form-b"
></sparnatural-form-queries>
<sparnatural-form id="form-b" ...></sparnatural-form>
```

Each component pre-fills **its own** form from the URL parameters that match that form's fields (parameters that do not match a form's fields are simply ignored by that form). A form that only needs URL pre-filling, with no dropdown, uses a component without `src` :

```html
<sparnatural-form-queries for="form-c"></sparnatural-form-queries>
<sparnatural-form id="form-c" ...></sparnatural-form>
```

Without `for`, a component falls back to the _single_ form on the page ; on a multi-form page it would then drive the wrong form. Always set `for` when more than one form is present.
