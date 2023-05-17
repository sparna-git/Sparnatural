_[Home](index.html) > Widgets_

# Sparnatural widgets

This is a reference documentation for Sparnatural widgets

## List query widget

### Appearance

Typical appearance of a list widget, allowing to select a URI value, shown with a label and number of occurrences, ordered by decreasing number of occurrences:

<img src=" https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-basic.png" />

Showing literal values only (EDM Type is a literal value) :

<img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-literals.png" />

Showing a mix of literal values and URIs :

<img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-mix-literal-URIs.png" />

Listing URI values with a label listed alphabetically :

<img src="https://raw.githubusercontent.com/sparna-git/Sparnatural/master/docs/assets/images/widgets/list-widget-no-occurrences.png" />


### Description

List widgets allow to select a value from a dropdown list. They are suitable if the list of distinct values is limited in size (typically less than 500 items). The widget provides a dropdown list combined with a filtering/search input to search within the list content. The input field to search within the list does not appear if the list is very small, under 20 items.
List widgets are implemented using the [select2 JQuery component](https://select2.org/).

List widgets can work both with URIs + labels, or with literal values. It can even mix URIs and literals in the same list.

The sort order of the elements in the list, as well as their precise labels, depends on the underlying SPARQL query that populates the list. Sparnatural provides default datasources that can be ordered alphabetically, alphabetically showing the number of occurrences in parenthesis, or ordered by decreasing number of occurrences.

### Configuration

In OWL configuration, declare a sub-property of [`http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#ListProperty)

### Datasources

The list of URI as well as their labels need to be [configured using a SPARQL datasource](http://docs.sparnatural.eu/OWL-based-configuration-datasources.html#preconfigured-datasources-for-a-listproperty).

## Autocomplete query widget
