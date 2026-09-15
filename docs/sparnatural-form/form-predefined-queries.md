_[Home](../index.html) > Sparnatural form > predefined queries_

# Predefined queries dropdown : `<sparnatural-form-queries>`

`<sparnatural-form-queries>` displays a **dropdown of ready-made example queries** above a `<sparnatural-form>`. When the user picks an entry, the form is pre-filled with its values.

```html
<sparnatural-form-queries
  src="form-configs/productions/query-remp.json"
  lang="en"
  for="form-productions"
></sparnatural-form-queries>

<sparnatural-form
  id="form-productions"
  src="form-configs/performances-shacl.ttl"
  form="form-configs/productions/form.json"
  query="form-configs/productions/query.json"
  endpoint="https://www.performing-arts.ch/sparql"
  lang="en"
></sparnatural-form>
```

> The examples on this page are taken from the [SAPA search site](https://search.performing-arts.ch), whose _Productions_ form offers such a dropdown.

The component is rendered **outside** the `<sparnatural-form>` element, so you can position and style it independently of the form.

> This component is only about the dropdown. **Pre-filling a form from the page URL is handled by `<sparnatural-form>` itself** and needs no extra element (see [Pre-filling from the URL](form-prefill.md)). Add `<sparnatural-form-queries>` only when you actually have a queries file to offer.

Selecting an entry pre-fills the form but does **not** submit it : the user reviews the criteria and runs the search themselves.

## Attributes

| Attribute | Description                                                                                             | Default             |
| --------- | ------------------------------------------------------------------------------------------------------- | ------------------- |
| `src`     | URL of the predefined queries JSON file. **Mandatory** : without it, the component has nothing to show. | none                |
| `for`     | `id` of the target `<sparnatural-form>`. If omitted, the single form on the page is used.               | single form on page |
| `lang`    | Language of the dropdown placeholder and of the [per-language query labels](#file-format).              | `en`                |

The component resolves its target form even if it is declared **before** that form in the HTML.

If no target form can be found, or if `src` is missing, an error is logged in the console and no dropdown is rendered.

## File format

The `src` file is a JSON object with a single `queries` array. Each entry has :

- `label` : the text shown in the dropdown ;
- `values` : the values to pre-fill, keyed by the **form variable** (the same `variable` names declared in the [form specification](form-configuration.md)).

```json
{
  "queries": [
    {
      "label": { "fr": "Productions", "en": "Productions" },
      "values": {
        "Activity_Type_22": {
          "label": "production",
          "criteria": {
            "rdfTerm": {
              "type": "uri",
              "value": "http://vocab.performing-arts.ch/muwgo"
            }
          }
        }
      }
    },
    {
      "label": "Productions from the 2020 season",
      "values": {
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
    }
  ]
}
```

### `label`

A `label` is either a plain string, or an object with one entry per language code. When it is an object, the [`lang`](#attributes) attribute picks the language, falling back to `en` then to the first entry available. In the example above, the first query uses a per-language label and the second a simple string.

### `values`

`values` is a **form query** : a flat object with one key per form field. Its complete reference is on the [form query JSON reference](form-query.md) page : the `{ label, criteria }` pair, the `criteria` shape of every widget, arrays for multi-value fields, and the `{ "anyValue": true }` / `{ "notExists": true }` markers.

In short :

```json
"values": {
  "Saison": { "label": "2020", "criteria": { "search": "2020" } },
  "TypeActor": [
    { "label": "Group", "criteria": { "rdfTerm": { "type": "uri", "value": "http://www.cidoc-crm.org/cidoc-crm/E74_Group" } } },
    { "label": "Legal Body", "criteria": { "rdfTerm": { "type": "uri", "value": "http://www.cidoc-crm.org/cidoc-crm/E40_Legal_Body" } } }
  ],
  "Title": { "notExists": true }
}
```

Selecting the entry resets the form, then applies exactly these values : fields absent from `values` are left empty.

## Several forms on the same page

A single page can host several independent `<sparnatural-form>` elements. Give every form an `id`, and add one `<sparnatural-form-queries>` per form that needs a dropdown, each pointing at its form through `for` :

```html
<sparnatural-form-queries
  src="form-configs/productions/query-remp.json"
  for="form-productions"
></sparnatural-form-queries>
<sparnatural-form id="form-productions" ...></sparnatural-form>

<sparnatural-form-queries
  src="form-configs/instantiations/query-remp.json"
  for="form-instantiations"
></sparnatural-form-queries>
<sparnatural-form id="form-instantiations" ...></sparnatural-form>
```

A form that needs no dropdown simply gets no component :

```html
<sparnatural-form id="form-agents" ...></sparnatural-form>
```

Without `for`, a component falls back to the _single_ form on the page ; on a multi-form page it would then drive the wrong form. Always set `for` when more than one form is present.

## See also

- [Form query JSON reference](form-query.md) - the full structure of `values`
- [Prefilling with URL parameters or a JSON query](form-prefill.md) - the other way to pre-fill a form, handled by `<sparnatural-form>` itself
- [Form configuration JSON reference](form-configuration.md) - where form variables are declared
