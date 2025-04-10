_[Home](index.html) > Sparnatural history_

# Sparnatural history Javascript integration

## Constructor

Sparnatural History is inserted as a custom HTML element named `<sparnatural-history>`:

```html
<sparnatural-history lang="en"></sparnatural-history>
```

This component does not provide a default button to open the history modal. This gives you full control over how and where to trigger it.

You can use any HTML element (a <button>, <div>, <icon>, etc.) to trigger the modal manually:

```html
<!-- Custom trigger button -->
<button id="myCustomButton" class="history-btn">
  History <i class="fas fa-history"></i>
</button>

<!-- Sparnatural and History -->
<spar-natural
  id="sparnatural"
  src="./configs/my-config.ttl"
  lang="en"
  endpoint="https://example.org/sparql"
/>
<sparnatural-history lang="en"></sparnatural-history>
```

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

Sparnatural History listens to the following **global events** triggered from the Sparnatural instance:

### `queryUpdated`

Triggered when the query is modified. Sparnatural History listens to it and stores the latest `queryJson` to prepare for submission.

```javascript
document.dispatchEvent(
  new CustomEvent("queryUpdated", {
    detail: { queryJson: queryJsonObject },
  })
);
```

### `submit`

Triggered when the user clicks the "submit" button. Sparnatural History saves the last recorded `queryJson` in the local storage.

```javascript
document.dispatchEvent(new CustomEvent("submit"));
```

## API Methods

| Method             | Description                                                                 | Parameters                   |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------- |
| openHistoryModal() | Opens the history modal manually (since there's no internal button anymore) | none                         |
| saveQuery(query)   | Public method to save a query manually to local storage                     | queryJson (ISparJson object) |

Queries from history are loaded by clicking the "load" button in the modal, which dispatches a loadQuery event with the corresponding queryJson.

## Internal Components

### `SparnaturalHistoryComponent`

The main component rendered inside <sparnatural-history>. Responsible for:

- Rendering the full history interface
- Initializing the selected language
- Handling the injection of the optional `specProvider` via `setSpecProvider()`, which enhances the rendering of labels for entities and properties

### `HistorySection`

Handles all the UI logic for the modal, including:

- Loading and displaying saved queries
- Applying a custom scrollable summary renderer
- Favoriting (star icons)
- Copying to clipboard
- Deleting entries
- Filtering by date range with a modal
- Graceful fallback for missing `specProvider`

### `DateFilterModal`

A modal window triggered by a calendar icon, allowing users to apply a date range filter (`minDate` / `maxDate`) on saved queries.

### `ConfirmationModal`

A confirmation dialog shown before critical actions, such as deleting a query or clearing all non-favorited history entries.

### `SparnaturalHistoryI18n`

Loads translation labels from language files in `/assets/lang/en-Hist.json` or `/fr-Hist.json`.

### `LocalDataStorage`

Singleton for handling browser `localStorage`:

- `getHistory()` — retrieves saved history
- `saveQuery(queryJson)` — saves a query with date
- `deleteQuery(id)` — deletes a query
- `clearHistory()` — clears all

## Typical Integration

Integration typically involves two components: `<spar-natural>` and `<sparnatural-history>`. They are linked via the binding method `bindSparnaturalWithHistory()`:

```javascript
bindSparnaturalWithHistory(sparnatural);
```

This binds:

- The `queryUpdated` and `submit` events to record queries
- The optional `specProvider` to improve label rendering (not required)

## Example Setup

```html
<spar-natural id="sparnatural" src="sparnatural-config.ttl" lang="en" />
<sparnatural-history lang="en"></sparnatural-history>
```

## Features Summary

- **No default button** – total control over your UI design
- **Local storage** of submitted queries
- **Favorites support** (star toggle)
- **Date range filter** via calendar modal
- **Copy, Load, Delete** actions for each saved query
- **Internationalization** (English/French)
- **Optional label enhancement** via `specProvider` injection
- **Customizable modal trigger**
