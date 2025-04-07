_[Home](index.html) > Sparnatural history_

# Sparnatural history Javascript integration

## Constructor

Sparnatural History is inserted as a custom HTML element named `<sparnatural-history>`:

```html
<sparnatural-history lang="en"></sparnatural-history>
```

This component displays a button for accessing the query history and opens a modal with a DataTable listing the previously submitted queries.

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

| Method                 | Description                                                             | Parameters                     |
| ---------------------- | ----------------------------------------------------------------------- | ------------------------------ |
| `loadQuery(queryJson)` | Loads a query from the history into the main `<spar-natural>` component | `queryJson` (ISparJson object) |

## Sparnatural history element API

The table below summarizes the various functions that can be called on the Sparnatural history element.

| Function                      | Description                                                                   | Parameters |
| ----------------------------- | ----------------------------------------------------------------------------- | ---------- |
| `sparnatural.enablePlayBtn()` | Removes the loading from the play button once a query has finished executing. | none       |

## Internal Components

### `SparnaturalHistoryComponent`

Main component rendered inside `<sparnatural-history>`. Responsible for rendering the history UI, initializing language, and dispatching the `initHist` event.

### `HistorySection`

Contains all UI logic and rendering for the history modal, including:

- Loading saved queries
- Favoriting
- Copying
- Deleting
- Applying a date range filter via `DateFilterModal`

### `DateFilterModal`

A simple modal that lets users choose a `minDate` and `maxDate` to filter the history.

### `ConfirmationModal`

Displays a confirmation dialog before deleting history items or clearing the full history.

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

- The `specProvider` to Sparnatural History after initialization
- The `queryUpdated` and `submit` events to record queries

## Example Setup

```html
<spar-natural id="sparnatural" src="sparnatural-config.ttl" lang="en" />
<sparnatural-history lang="en"></sparnatural-history>
```

## Features Summary

- **Automatic storage** of query history in `localStorage`
- **Support for favorites** (★ icons)
- **Date range filter** via calendar modal
- **Internationalization** (English/French)
- **Copy/Load/Delete** actions per query
