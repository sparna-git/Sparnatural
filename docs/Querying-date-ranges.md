_[Home](index.html) > Querying date ranges_

# Querying date ranges

## The problem

Your RDF Knowledge Graph may contains resources that are associated to a date range, with a begin date and a end date, typically:

  - Persons with a birth and death date.
  - Archival resources with a coverage period.
  - Activities/Events with a start and end date.
  - Organizations with a beginning and end of activity.
  - etc.

Expressing a query to easily search for such resources is cumbersome, as it requires to query on the **interval** expressed by 2 properties that capture the beginning and end of the interval.
In addition, the resources may sometimes have only a start date, or only a end date set.
Even more complicated, the resources can have _sometimes a date range_, and _sometimes a single date_, like Events described with either a start and end date, or a single date property.

This requires the user to express a query that indicates _I search for all resources where the begin date is between date A and B (or if they have no begin date then their end date must be after the provided begin date), or the end date is between A and B (or if they don't have a end date then their begin date must be before the provided end date), or the exact date is between A and B_. Pretty simple isn't it ? :-)

Not even mentionning the cases where a search is made to search everything after a certain date, or everything before a certain date.

## The solution

Sparnatural offers a dedicated feature to search on date range. To use it:

1. Create a Sparnatural TimeProperty, either that provides a widget to select with years only, or with a date.
2. Annotate your Sparnatural property with [`core:beginDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#beginDateProperty) and [`core:endDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#endDateProperty) to indicate the properties used in the RDF graph that express the begin date and the end date of your resources.
3. Optionnaly, if resources in the graph can also indicate an exact date, annotate your Sparnatural property with [`core:exactDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#exactDateProperty) to indicate it.

The properties you indicate can be either:
  - IRIs of properties from the graph
  - IRIs of properties in your SPARQL configuration, that are themselves mapped to a property path using a [`core:sparqlString`](http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString) annotation


The generated SPARQL query will search for the resources that **overlap** with the date range being queried, or, if you have specified an exact date, where the exact date falls into the searched date range.

The generated query looks like the following example, that searches for any archives that overlap the period 1700 and 1750. Archives can have:
  - a beginning date expressed with `<https://www.ica.org/standards/RiC/ontology#beginningDate>|<https://www.ica.org/standards/RiC/ontology#date>`
  - an end date expressed with `<https://www.ica.org/standards/RiC/ontology#endDate>|<https://www.ica.org/standards/RiC/ontology#date>`
  - an exact date expressed with `<https://www.ica.org/standards/RiC/ontology#date>`

```
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX xsd: <http://www.w3.org/2001/XMLSchema#>
PREFIX rdfs: <http://www.w3.org/2000/01/rdf-schema#> 
PREFIX skos: <http://www.w3.org/2004/02/skos/core#> 
SELECT DISTINCT ?this ?this_label WHERE {
  ?this rdf:type <https://sparnatural-demo-anf.huma-num.fr/ontology#Archive>.
  
  {
    # The exact date falls in searched date range
    ?this <https://www.ica.org/standards/RiC/ontology#date> ?Date_1_exact.
    FILTER(((xsd:dateTime(?Date_1_exact)) >= "1700-01-01T00:00:00"^^xsd:dateTime) && ((xsd:dateTime(?Date_1_exact)) <= "1750-12-31T23:59:59"^^xsd:dateTime))
  }
  UNION
  {
    {
      # ... or the beginning date and end date of the resouce are known,
      # and there is an overlap with the searched date range
      ?this <https://www.ica.org/standards/RiC/ontology#beginningDate>|<https://www.ica.org/standards/RiC/ontology#date> ?Date_1_begin;
        <https://www.ica.org/standards/RiC/ontology#endDate>|<https://www.ica.org/standards/RiC/ontology#date> ?Date_1_end.
      FILTER((xsd:dateTime(?Date_1_begin)) <= "1750-12-31T23:59:59"^^xsd:dateTime)
      FILTER((xsd:dateTime(?Date_1_end)) >= "1700-01-01T00:00:00"^^xsd:dateTime)
    }
    UNION
    {
      # ... or only the beginning date of the resource is known,
      # and it is before end of searched date range 
      ?this <https://www.ica.org/standards/RiC/ontology#beginningDate>|<https://www.ica.org/standards/RiC/ontology#date> ?Date_1_begin.
      FILTER(NOT EXISTS { ?this <https://www.ica.org/standards/RiC/ontology#endDate>|<https://www.ica.org/standards/RiC/ontology#date> ?Date_1_end. })
      FILTER((xsd:dateTime(?Date_1_begin)) <= "1750-12-31T23:59:59"^^xsd:dateTime)
    }
    UNION
    {
      # ... or only the end date of the resource is known,
      # and it is after begin of searched date range   
      ?this <https://www.ica.org/standards/RiC/ontology#endDate>|<https://www.ica.org/standards/RiC/ontology#date> ?Date_1_end.
      FILTER(NOT EXISTS { ?this <https://www.ica.org/standards/RiC/ontology#beginningDate>|<https://www.ica.org/standards/RiC/ontology#date> ?Date_1_begin. })
      FILTER((xsd:dateTime(?Date_1_end)) >= "1700-01-01T00:00:00"^^xsd:dateTime)
    }
  }
  ?this <http://www.w3.org/2000/01/rdf-schema#label> ?this_label.
}
LIMIT 10000
```
