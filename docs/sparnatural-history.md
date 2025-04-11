_[Home](index.html) > Sparnatural history_

# Sparnatural history Javascript integration

## Constructor

Sparnatural History is inserted as a custom HTML element named `<sparnatural-history>`:

```html
<sparnatural-history lang="en"></sparnatural-history>
```

This element represents the modal dialog that manages the history. It is invisble by default. You need to open the modal dialog from a button or a link in the main page.

You can use any HTML element (a `<button>`, `<div>v, `<icon>`, etc.) to trigger the history modal manually:

```html
<!-- Custom trigger button -->
<button id="myCustomButton" class="history-btn">
  History <i class="fas fa-history"></i>
</button>

<!-- History modal dialog -->
<sparnatural-history lang="en"></sparnatural-history>
```

To open the history modal, call the function `.openHistoryModal()` on the `sparnatural-history` element:

```javascript
const historyComponent = document.querySelector("sparnatural-history");

document.getElementById("myCustomButton").addEventListener("click", () => {
  historyComponent.openHistoryModal();
});
```

This gives you complete flexibility to place the history trigger wherever and however you want in your UI.

## HTML Attributes Reference

| Attribute | Description                                                | Default | Mandatory/Optional |
| --------- | ---------------------------------------------------------- | ------- | ------------------ |
| `lang`    | Language to use for labels and translations (`en` or `fr`) | `en`    | Optional           |

## Sparnatural history events

Sparnatural History sends the following events

### `init`

Triggered when the component has finished its initialization.

### `loadQuery`

Triggered when the user clicks the "load query" button in the history modal dialog. This is the event to listen to to load the query in Sparnatural. The query is accessible in the `event.detail.query` attribute.

```javascript
const sparnatural = document.querySelector("sparnatural");
const sparnaturalHistory = document.querySelector("sparnatural-history");
sparnaturalHistory.addEventListener("loadQuery", (event) => {
  const query = event.detail.query;
  sparnatural.loadQuery(query);
});
```

## API Methods

| Method             | Description                                                                 | Parameters                   |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------- |
| `openHistoryModal()` | Opens the history modal dialog | none                         |
| `saveQuery(query)`   | Save a query in the history | queryJson (ISparJson object) |
| `notifyConfiguration(config)`   | Notifies the Sparnatural configuration to the history component | Sparnatural configuration |

## Typical manual integration

Typically, the integration involves:
  1. (optional) Passing the configuration from Sparnatural to the sparnatural-history element
  2. saving the Sparnatural JSON query to the history whenever the query is submitted from Sparnatural
  3. loading the query in Sparnatural whenever the user loads it from the history

```javascript
const sparnatural = document.querySelector("sparnatural");
const sparnaturalHistory = document.querySelector("sparnatural-history");

sparnatural.addEventListener("init", () => {
  // ... other actions here ...
  // notify the history component of the configuration
  sparnaturalHistory.notifyConfiguration(event.detail.config);
});

sparnatural.addEventListener("queryUpdated", (event) => {
  // ... other actions here ...
  // Whenever the query changes, save it the JSON in a hidden field
  document.getElementById("query-json").value = JSON.stringify(
    event.detail.queryJson
  );
});

sparnatural.addEventListener("submit", () => {
  // ... other actions here ...
  // Whenever the query is submitted, send it to the history component
  // use saveQuery method from history component
  sparnaturalHistory.saveQuery(document.getElementById("query-json").value);
});

// Whenever a query is loaded from the history, load it in Sparnatural
sparnaturalHistory.addEventListener("loadQuery", (event) => {
  const query = event.detail.query;
  sparnatural.loadQuery(query);
});
```

## Typical integration via sparnatural-bindings.js

The manual integration described above can be directly 

```javascript
const sparnatural = document.querySelector("sparnatural");
const sparnaturalHistory = document.querySelector("sparnatural-history");
bindSparnaturalWithHistory(sparnatural, sparnaturalHistory);
```

