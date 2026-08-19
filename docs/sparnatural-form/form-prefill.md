_[Home](../index.html) > Sparnatural form > form pre-filling_

# Prefilling Sparnatural-form with URL parameters or a JSON query

`<sparnatural-form>` reads the page URL when it finishes initializing, and **pre-fills its fields from the URL parameters**. This lets you share a link that opens the form with a ready-made search and runs it automatically.

Nothing has to be added to the page for this, the behaviour is built into the `<sparnatural-form>` element itself.

```html
<sparnatural-form
  id="form-productions"
  src="form-configs/performances-shacl.ttl"
  form="form-configs/productions/form.json"
  query="form-configs/productions/query.json"
  endpoint="https://www.performing-arts.ch/sparql"
  lang="en"
></sparnatural-form>
```

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen&Saison=2020
```

> The [predefined queries dropdown](form-predefined-queries.md) is a **separate** feature, provided by the `<sparnatural-form-queries>` element. You only need that element if you have a queries file to offer ; URL pre-filling works without it.

There are **two ways** to pre-fill the form from the URL :

- passing a **full JSON query** in a single `query` parameter (the display labels are part of the query) ;
- passing **one raw value per variable**, in a simpler and cleaner URL, where display labels are resolved automatically.

If a `query` parameter is present it takes precedence, and the per-variable parameters are ignored.

## Prefilling form with a JSON query

The `query` parameter takes a **form query** : a flat JSON object mapping each form variable to the value to pre-select. This is the structure described on the [Sparnatural-form JSON query reference](form-query.md) page, the same one used as `values` in a [predefined queries file](form-predefined-queries.md#values).

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

Arrays of criteria, for [multi-value fields](form-query.md#several-values-in-one-field), and the `{ "anyValue": true }` / `{ "notExists": true }` [markers](form-query.md#option-markers--unknown-and-any-known-value) are accepted here too. The shape of `criteria` for each widget is documented in [Criteria values](../archives/Query-JSON-format-v12.md#criteria-values).

This JSON must be **URL-encoded** and passed as the `query` parameter :

```
https://search.performing-arts.ch/pages/en/instantiations/?query=%7B%22RepresentationType%22%3A%7B%22label%22%3A%22acoustic%22%2C%22criteria%22%3A%7B%22rdfTerm%22%3A%7B%22type%22%3A%22uri%22%2C%22value%22%3A%22http%3A%2F%2Fvocab.performing-arts.ch%2Frtac%22%7D%7D%7D%2C%22UniqueIDValue%22%3A%7B%22label%22%3A%221067%22%2C%22criteria%22%3A%7B%22search%22%3A%221067%22%7D%7D%7D
```

If an invalid JSON is passed, an error is logged in the console and no pre-fill happens.

This mode gives you full control over the criteria and the displayed labels, at the cost of a long URL. It does **not** auto-submit the form, the `exec` parameter only applies to the per-variable mode below.

## Parameter name = form variable

In the per-variable mode, every URL query parameter (except the reserved ones) is interpreted as a **form field to pre-fill**. The parameter **name** is the `variable` of the field, as declared in the [form specification](form-configuration.md), and the parameter **value** is the value to inject.

For example, the SAPA _Productions_ form declares the variables `Title` and `Saison` :

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen&Saison=2020
```

opens the form with the `Title` field filled with `Carmen` and the `Saison` field filled with `2020`.

You can pass as many parameters as you want. A parameter whose name does not match any form variable is simply ignored, with a warning in the console.

The parameter name is matched against the form variables **case-insensitively** : `?title=Carmen` and `?TITLE=Carmen` both fill the `Title` field. An exact match always wins over a case-insensitive one.

**Reserved parameter names**, never treated as form fields :

| Parameter | Role                                                                     |
| --------- | ------------------------------------------------------------------------ |
| `query`   | The [full JSON query](#prefilling-form-with-a-json-query) mode.          |
| `exec`    | [Auto-submit](#exec-parameter-auto-submit-after-url-pre-filling) switch. |
| `lang`    | Page-level language, left to the hosting page.                           |

## Parameter values

The value syntax depends on the **widget** configured for the field in the [Sparnatural configuration](../SHACL-based-configuration.md). Each widget parses the raw string itself, so you only have to write the value in its own format and the form builds the corresponding criteria and its display label.

Values must be **URL-encoded**, as always.

### IRI (List, Autocomplete and Tree widgets)

For fields that take an IRI as value, pass the **URL-encoded IRI**.

```
https://search.performing-arts.ch/pages/en/instantiations/?RepresentationType=http%3A%2F%2Fvocab.performing-arts.ch%2Frtac
```

The label of that IRI is **fetched automatically** from the endpoint, so the field shows _"acoustic"_ rather than the raw IRI. The label is looked up with the label property configured for the class of the field, its `defaultLabelProperty` if it declares one, otherwise `skos:prefLabel` for a SKOS concept, otherwise `rdfs:label|skos:prefLabel`.

The language used is the one of the **`lang` attribute** of `<sparnatural-form>`, falling back to its **`defaultLang`** attribute. If no label can be resolved (unknown IRI, no label in either language, unreachable endpoint), the field falls back to displaying the IRI itself, and the criteria is still applied.

Because this lookup is a SPARQL query, IRI fields are the only ones that resolve asynchronously ; auto-submit waits for all of them before running the search.

### Dates (Date and Year widgets)

Pass a range as **`start|stop`**, the two bounds separated by a pipe. Each bound is a year or a date ; either one can be left empty for an open-ended range.

```
https://example.org/search?CreationYear=1800%7C1901
https://example.org/search?CreationDate=2020-05-12%7C2020-06-30
https://example.org/search?CreationYear=1900%7C
https://example.org/search?CreationYear=%7C1950
```

On a **year** widget the bounds are widened to the whole year : `1800|1901` covers 1800-01-01 through 1901-12-31. Negative years are supported (`-500|-200`).

If neither bound is a valid date, or if the start is later than the stop, an error is logged and the field is left empty.

### Number (Number widget)

Pass a range as **`min|max`**, same pipe syntax as dates. Either bound can be left empty.

```
https://example.org/search?Size=10000%7C100000
https://example.org/search?Size=10000%7C
https://example.org/search?Size=%7C100000
```

A value without a pipe is read as the **minimum** only : `?Size=10000` means "at least 10000".

### Map (Map widget)

Pass a list of points as **`lat,lng;lat,lng;…`** : points separated by semicolons, latitude and longitude separated by a comma.

- **two points** are read as two opposite corners of a **rectangle** ;
- **three points or more** are read as the vertices of a **polygon**.

```
https://example.org/search?Place=46.9%2C7.4%3B47.5%2C8.6
https://example.org/search?Place=46.9%2C7.4%3B47.5%2C8.6%3B47.1%2C9.2
```

At least two points are required ; a malformed coordinate logs an error and leaves the field empty.

### Boolean (Boolean widget)

Pass `true` or `1` for true. Any other value is read as false.

```
https://example.org/search?IsDigitized=true
```

### Text (Search widgets)

Pass the search text as is. It is used exactly as typed, with no parsing.

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen
https://search.performing-arts.ch/pages/en/instantiations/?UniqueIDValue=1067
```

### Special values : "Unknown" and "Any known value"

Two reserved keywords pre-select the _"Unknown"_ and _"Any known value"_ options of a field, instead of an actual value. They work on any widget.

| Keyword   | Effect                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `UNKNOWN` | Ticks the field's **"Unknown"** option (the value must not exist, a `FILTER NOT EXISTS` in SPARQL). |
| `ANY`     | Ticks the field's **"Any known value"** option (the value can be anything, as long as it exists).    |

Both keywords are **case-insensitive** (`UNKNOWN`, `unknown` and `Unknown` all work).

```
https://search.performing-arts.ch/pages/en/productions/?Saison=UNKNOWN
```

opens the form with the `Saison` field set to _"Unknown"_.

These options only exist on fields that are declared optional in the underlying query. If a field has no such option, the keyword is ignored and a warning is logged in the console. Their equivalents in the JSON mode are the [`anyValue` / `notExists` markers](form-query.md#option-markers--unknown-and-any-known-value).

## Passing several values to a single field

Some fields are configured to accept **more than one value** (multi-value). To pre-fill such a field with several values, **repeat the parameter** :

On the SAPA _Productions_ form, `TypeActor` (_Type of Agent_) accepts several values :

```
https://search.performing-arts.ch/pages/en/productions/?TypeActor=http%3A%2F%2Fwww.cidoc-crm.org%2Fcidoc-crm%2FE74_Group&TypeActor=http%3A%2F%2Fwww.cidoc-crm.org%2Fcidoc-crm%2FE40_Legal_Body
```

This opens the form with the `TypeActor` field holding both values, _Group_ and _Legal Body_.

Each repeated value is interpreted individually, following the syntax of the field's widget above. If the field is configured to accept only **one** value, the extra values are ignored and a warning is shown next to the field ; values are only stacked on multi-value fields.

## `exec` parameter (Auto-submit after URL pre-filling)

When the form is pre-filled from per-variable URL parameters, it is **submitted automatically** once the pre-filling is complete, including the asynchronous label resolution of IRI fields, so that a shared link directly shows the results without the user having to click the search button.

To pre-fill the form **without** submitting it, for instance to let the user review or adjust the criteria first, add `exec=false` :

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen&Saison=2020&exec=false
```

Any other value of `exec`, or its absence, keeps the default behaviour and submits the form.

> Auto-submit applies to the **per-variable** URL mode only. The [`query` parameter](#prefilling-form-with-a-json-query) and the [predefined-queries dropdown](form-predefined-queries.md) pre-fill the form without submitting it : the user triggers the search themselves.

## Several forms on the same page

A single page can host several independent `<sparnatural-form>` elements. **Each one reads the same page URL** and picks up the parameters that match its own fields ; parameters that match none of a form's variables are ignored by that form.

So on a multi-form page, make sure the forms do not share variable names unless you actually want a single parameter to fill both.

## See also

- [Form query JSON reference](form-query.md) - the structure taken by the `query` parameter
- [Predefined queries dropdown](form-predefined-queries.md) - offering ready-made queries in a dropdown
- [Form configuration JSON reference](form-configuration.md) - where form variables are declared
