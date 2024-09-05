_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

# Questions Fréquemment Posées

## Configuration

#### Comment configurer une recherche sur les dates ?

...

Initialement posée dans [l'issue 314](https://github.com/sparna-git/Sparnatural/issues/314).

#### Comment effectuer une recherche dans le sens inverse ?

...

Initialement posée dans [l'issue 317](https://github.com/sparna-git/Sparnatural/issues/317).

#### Comment configurer une recherche sur un champ de texte ?

...

Initialement posée dans [l'issue 309](https://github.com/sparna-git/Sparnatural/issues/309).

#### Comment mapper une classe vers plus d'une classe cible ?

...

Initialement posée dans [l'issue 318](https://github.com/sparna-git/Sparnatural/issues/318).

#### Comment définir de jolis préfixes dans la requête SPARQL de sortie ? Puis-je utiliser des valeurs préfixées dans l'annotation sparqlString ?

Cela n'est actuellement pas possible, évitez d'utiliser des préfixes dans sparqlString.

Voir aussi [Prototype Wikidata de Sparnatural](https://github.com/lubianat/sparnatural_wikidata_prototype/pull/4).

#### Comment configurer Sparnatural sur Wikidata ?

Voir [Prototype Wikidata de Sparnatural](https://github.com/lubianat/sparnatural_wikidata_prototype).

- Définissez le point de terminaison SPARQL cible sur `https://query.wikidata.org/sparql`
- Utilisez l'option de configuration `typePredicate` avec une valeur de `http://www.wikidata.org/prop/direct/P31`
- Vous pouvez configurer une requête d'autocomplétion personnalisée avec une queryString comme suit :

```
SELECT DISTINCT ?uri ?label
WHERE {
    ?domain <http://www.wikidata.org/prop/direct/P31>  $domain .
    ?domain $property ?uri .
    ?uri rdfs:label ?label .
    FILTER(isIRI(?uri))
    FILTER(lang(?label) = \"\" || lang(?label) = $lang)
    FILTER(CONTAINS(LCASE(STR(?label)), LCASE(\"$key\")))
}
ORDER BY UCASE(?label)
LIMIT 50
```

- Les listes déroulantes ne fonctionnent actuellement pas correctement en raison de la lenteur du service de requête de Wikidata.

#### Comment afficher automatiquement une étiquette lorsque l'utilisateur clique sur l'icône "œil" ?

...

Voir [l'issue 3 dans le Prototype Wikidata de Sparnatural](https://github.com/lubianat/sparnatural_wikidata_prototype/issues/3).

#### Les sources de données par défaut utilisent la fonction `langMatches()` et renvoient des langues en double, est-il possible de changer cela en `lang()` à la place ?

Vous devez créer une source de données personnalisée avec une requête SPARQL personnalisée pour cela. Voir https://docs.sparnatural.eu/OWL-based-configuration-datasources#your-own-sparql-query-lists--autocomplete et voir un exemple à https://github.com/sparna-git/sparnatural.eu/blob/main/demos/demo-smt-cim10/sparnatural-config.ttl#L117

_/!\ Cette page a été traduite automatiquement depuis la version anglaise_

Originalement demandé dans [issue 327](https://github.com/sparna-git/Sparnatural/issues/327).
