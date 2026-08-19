_[Home](../index.html) > Sparnatural form > form query JSON_

# Sparnatural-form JSON query reference

A **form query** is a small JSON object describing a set of values to put in the fields of a Sparnatural form. It is what the form gets pre-filled with, and the same structure is accepted in three places :

- the `values` of an entry of a [predefined queries file](form-predefined-queries.md) (typically `query-remp.json`) ;
- the `query` [URL parameter](form-prefill.md#prefilling-form-with-a-json-query) ;
- the `loadQuery()` method of the `<sparnatural-form>` element.

> **Not the same thing as the `query` attribute** of `<sparnatural-form>`. That attribute points at the full Sparnatural query the form *executes*, in the [v12 query format](../archives/Query-JSON-format-v12.md). The form query described here is the small flat structure used to *fill in* the form.

## Structure

One key per form field, no nesting. This one pre-fills two fields of the SAPA _Productions_ form :

```json
{
  "Activity_Type_22": {
    "label": "production",
    "criteria": {
      "rdfTerm": {
        "type": "uri",
        "value": "http://vocab.performing-arts.ch/muwgo"
      }
    }
  },
  "Saison": {
    "label": "2020",
    "criteria": { "search": "2020" }
  }
}
```

Each **key** is a form variable, as declared in the `variable` of a binding of the [form specification](form-configuration.md). Keys are matched **case-insensitively** (an exact match wins), and a key matching no form field is skipped with a warning in the console.

Each **value** is one of three things :

| Value                                                           | Effect                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| a [labelled criteria](#labelled-criteria)                        | fills the field with one value                             |
| an [array of labelled criteria](#several-values-in-one-field)    | fills a multi-value field with several values              |
| an [option marker](#option-markers--unknown-and-any-known-value) | ticks the field's _"Unknown"_ / _"Any known value"_ option |

Loading a form query always **resets the whole form first**, so the resulting state is exactly what the object describes : fields not mentioned are left empty.

## Labelled criteria

A single value is a `{ label, criteria }` pair :

```json
{ "label": "2020", "criteria": { "search": "2020" } }
```

- `label` : the text displayed in the field. It is used as is : in a form query, labels are **not** resolved automatically, unlike the [per-variable URL parameters](form-prefill.md#parameter-values). Always provide one, otherwise the field shows an empty value.
- `criteria` : the value itself. Its shape depends on the **widget** configured for the field.

This is exactly the labelled criteria of the underlying Sparnatural query, the same objects that go in the `criterias` array of a query line. Rather than repeating them here, see the v12 query format reference :

- [Labelled Criterias](../archives/Query-JSON-format-v12.md#labelled-criterias) - the `{ label, criteria }` pair
- [Criteria values](../archives/Query-JSON-format-v12.md#criteria-values) - the shape of `criteria` for each widget : `rdfTerm` (URI, or literal with a language or a datatype), `start`/`stop` for dates, `min`/`max` for numbers, `boolean`, `search`, and `coordType`/`coordinates` for maps

## Several values in one field

Some fields accept **more than one value**. Pass an array of labelled criteria :

```json
{
  "TypeActor": [
    {
      "label": "Group",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E74_Group"
        }
      }
    },
    {
      "label": "Legal Body",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E40_Legal_Body"
        }
      }
    }
  ]
}
```

If the field accepts only **one** value, the extra values are ignored.

## Option markers : "Unknown" and "Any known value"

Instead of a value, a field can be set to one of its two options :

```json
{ "Saison": { "notExists": true } }
```

| Marker                  | Effect                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| `{ "notExists": true }` | Ticks the field's **"Unknown"** option (`FILTER NOT EXISTS` in SPARQL). |
| `{ "anyValue": true }`  | Ticks the field's **"Any known value"** option.                         |

`notExists` wins if both are set. The URL equivalents are the [`UNKNOWN` and `ANY` keywords](form-prefill.md#special-values--unknown-and-any-known-value).

These options only exist on fields whose branch is declared `optional` in the query the form executes. If a field has no such option, the marker is ignored and a warning is logged in the console.

## Complete example

```json
{
  "Activity_Type_22": {
    "label": "production",
    "criteria": {
      "rdfTerm": {
        "type": "uri",
        "value": "http://vocab.performing-arts.ch/muwgo"
      }
    }
  },
  "TypeActor": [
    {
      "label": "Group",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E74_Group"
        }
      }
    },
    {
      "label": "Legal Body",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E40_Legal_Body"
        }
      }
    }
  ],
  "Title": {
    "label": "Carmen",
    "criteria": { "search": "Carmen" }
  },
  "Saison": { "notExists": true }
}
```

Four fields of the SAPA _Productions_ form : a single URI, two values in a multi-value field, a free-text search, and an _"Unknown"_ option.

## See also

- [`<sparnatural-form-queries>`](form-predefined-queries.md) - where this structure is used as `values`
- [Prefilling with URL parameters or a JSON query](form-prefill.md) - where it is used as the `query` parameter, and the simpler per-variable alternative
- [Query JSON format v12](../archives/Query-JSON-format-v12.md) - the criteria reference, and the format of the `query` attribute
- [Form configuration JSON reference](form-configuration.md) - where form variables are declared
