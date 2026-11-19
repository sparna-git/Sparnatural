_[Home](index.html) > Accessibility features_

# Accessibility features

_\/!\ These improvements are available since version 14 of Sparnatural._

Sparnatural can be used with strong zoom, with a screen reader, and with the keyboard. This page describes what is supported on these three points, and then explains how to build a query using the keyboard.

## Zoom

Sparnatural remains usable when you enlarge the page with the browser's zoom, up to 200%. When space is limited, the display adapts:

- long text, such as the name of a property, is truncated with "..." and displays in full on mouse hover;
- around the value field, texts like "(Place Type)" and "Select" are hidden. If this is not sufficient, the field moves under "All";
- "Search for Place Type that +" displays on two lines;
- during list loading, the message "(searching...)" displays in the list instead of appearing to the right;
- the buttons "Reset search" and "Run search" remain visible.

<img src="/assets/images/accessibility/zoom-200.png" alt="Sparnatural with 200% zoom" width="700">

## Screen readers

These improvements have been tested with the NVDA screen reader and the Firefox browser.

### Named buttons

Buttons that only display an icon have a name, read by the screen reader. Lines are numbered in their display order, which allows knowing on which line a button acts. For example:

- **lists** of the subject, property, and object: "Choose subject", "Choose property", "Choose object";
- **the cross of a line**: "Remove line 2";
- **the cross of a value**: "Remove value Rue";
- **the eye**: "Display Place in results" or "Hide Place from results";
- **the green arrow**: "Line 2 options";
- **the "+" button**: "Add a value to Place Type";
- **the "and" button**: "and, add a line after line 2";
- **search buttons**: "Reset search" and "Run search".

Result options are named in the same way: "Sort A to Z", "Column name", "Column aggregation Place", "Display result options".

### Announcements

After an action, a short message is read, for example:

- "Selection: Place"
- "Value rue added", "Value rue removed"
- "Line 2 added", "Line 2 removed"
- "Searching for possible values", "No results for line 2"
- "Search launched", "Search reset"
- "Column Place displayed in results"

These announcements are short and do not repeat the information already read by the screen reader.

## Keyboard

Most of Sparnatural can be used with the keyboard. Here is how to:

### Navigate in a form field

In the following text, a ** widget** is a search field with its value(s), such as a dropdown list, an autocomplete field, or a tree.

- Go from one widget to another with the **Tab** or **Shift+Tab** keys:
  - **Tab** goes to the next widget;
  - **Shift+Tab** goes to the previous widget.
- Once in a widget, open it with the **Enter** or **Space** key:
  - The widget opens and its first value is selected;
  - if the widget has no value, the search field is selected.
- In the widget, navigate with the **Up** and **Down** arrow keys to select a value.
- To select a value:
  - press **Enter**; or
  - type its first letters.
- In an autocomplete field or a tree, type to search for a value:
  - the search is done character by character;
  - delete the last character with **Backspace**.
- To close the widget without selection, press the **Escape** key.

### Special cases

- **In a tree**, once a node is selected, press:
  - the **Right arrow** key to unfold it;
  - the **Left arrow** key to fold it.
- **In a single choice widget** (a widget that expects a single value and offers a value in a dropdown list):
  - **Enter** on the selected value validates the choice and closes the widget;
  - **Enter** on the search field opens the dropdown list of values.
- **In a multiple choice widget** (a widget that expects multiple values):
  - **Enter** on a value validates the choice and adds the value to the widget;
  - to remove a value from the widget, go to the value with the **Tab** key and press the **Delete** or **Backspace** key.

### Modify the query

A Sparnatural query is made up of **lines**. Each line is made up of three fields: **subject**, **property**, and **object**. Some lines have a **"+" button** to add a value to the object.

- To **add a line**, go to a line with **Tab** and press **Enter** on the green arrow: a new line is added after the current line.
  - If the last line is already the current line, the new line is added after it.
- To **delete a line**, go to the line with **Tab** and press the **Delete** key: the line is removed and the next line becomes current.

### Execute the query

- Go to the **"Run search"** button with **Tab** and press **Enter** or **Space** to execute the query.
- Go to the **"Reset search"** button with **Tab** and press **Enter** or **Space** to reset the query.

## Note on multi-criteria fields

If a field offers to select several values, such as "Type of Place", you can select several values in that field. To do this:

1. Open the field with **Enter** or **Space**;
2. Select a value with **Enter**;
3. The value is added to the field, and the field remains open;
4. Select another value, and so on;
5. Close the field with **Escape** when finished.
