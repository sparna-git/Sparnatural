_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

_[Accueil](index.html) > Interrogation des plages de dates_

# Interrogation des plages de dates

## Le problème

Votre graphe de connaissances RDF peut contenir des ressources associées à une plage de dates, avec une date de début et une date de fin, typiquement :

  - Personnes avec une date de naissance et de décès.
  - Ressources archivistiques avec une période de couverture.
  - Activités/Événements avec une date de début et de fin.
  - Organisations avec un début et une fin d'activité.
  - etc.

Exprimer une requête pour rechercher facilement de telles ressources est fastidieux, car cela nécessite de requêter sur l'**intervalle** exprimé par 2 propriétés qui capturent le début et la fin de l'intervalle.
De plus, les ressources peuvent parfois n'avoir qu'une date de début, ou seulement une date de fin définie.
Encore plus compliqué, les ressources peuvent avoir _parfois une plage de dates_, et _parfois une seule date_, comme des événements décrits avec soit une date de début et de fin, soit une seule propriété de date.

Cela oblige l'utilisateur à exprimer une requête qui indique _Je recherche toutes les ressources où la date de début est comprise entre la date A et B (ou si elles n'ont pas de date de début alors leur date de fin doit être après la date de début fournie), ou la date de fin est comprise entre A et B (ou si elles n'ont pas de date de fin alors leur date de début doit être avant la date de fin fournie), ou la date exacte est comprise entre A et B_. Plutôt simple n'est-ce pas ? :-)

Sans même mentionner les cas où une recherche est effectuée pour trouver tout après une certaine date, ou tout avant une certaine date.

## La solution

Sparnatural propose une fonctionnalité dédiée pour rechercher sur une plage de dates. Pour l'utiliser :

1. Créez une TimeProperty Sparnatural, soit en fournissant un widget pour sélectionner uniquement des années, soit avec une date.
2. Annoter votre propriété Sparnatural avec [`core:beginDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#beginDateProperty) et [`core:endDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#endDateProperty) pour indiquer les propriétés utilisées dans le graphe RDF qui expriment la date de début et la date de fin de vos ressources.
3. Optionnellement, si les ressources dans le graphe peuvent également indiquer une date exacte, annotez votre propriété Sparnatural avec [`core:exactDateProperty`](http://data.sparna.fr/ontologies/sparnatural-config-core#exactDateProperty) pour l'indiquer.

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

Les propriétés que vous indiquez peuvent être soit :
  - des IRI de propriétés du graphe
  - des IRI de propriétés dans votre configuration SPARQL, qui sont eux-mêmes mappés à un chemin de propriété en utilisant une annotation [`core:sparqlString`](http://data.sparna.fr/ontologies/sparnatural-config-core#sparqlString)

La requête SPARQL générée recherchera les ressources qui **se chevauchent** avec la plage de dates interrogée, ou, si vous avez spécifié une date exacte, où la date exacte se situe dans la plage de dates recherchée.

La requête générée ressemble à l'exemple suivant, qui recherche des archives qui se chevauchent avec la période 1700 et 1750. Les archives peuvent avoir :
  - une date de début exprimée avec `<https://www.ica.org/standards/RiC/ontology#beginningDate>|<https://www.ica.org/standards/RiC/ontology#date>`
  - une date de fin exprimée avec `<https://www.ica.org/standards/RiC/ontology#endDate>|<https://www.ica.org/standards/RiC/ontology#date>`
  - une date exacte exprimée avec `<https://www.ica.org/standards/RiC/ontology#date>`

```sparql
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
