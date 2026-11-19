_[Accueil](index.html) > Navigation par facettes_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../Faceted-browsing.md) - le 19/11/2026


# Activation de la navigation par facettes

## Cas d'utilisation

Par défaut, lors de l'exploration d'un graphe de connaissances, toute combinaison possible de critères peut être exprimée par l'utilisateur, de sorte que, même si 2 lignes retourneraient séparément des résultats, la combinaison de celles-ci ne retourne rien (par exemple, _Lieu de type "Montagne"_ d'une part, et _Lieu situé dans la rue "Rue X"_ d'autre part : les deux retournent des résultats séparément, mais comme aucune montagne ne peut être dite située dans une rue, la combinaison des 2 critères ne retourne rien). De plus, lors de la sélection de valeurs dans une liste ou un champ d'autocomplétion, la liste des valeurs proposées ne sera que celle effectivement utilisée dans les données pour le **critère actuel**, mais elle ne tient pas compte du reste des critères de la requête.


## La solution

À partir de la version 14, Sparnatural prend en charge un mode de **"navigation par facettes"** qui filtrera dynamiquement les critères et les valeurs dans l'exploration du graphe, en fonction de la requête complète.

### Activation du mode de navigation par facettes

Pour activer le mode de navigation par facettes, il suffit de définir l'attribut `facetedBrowsing` sur l'élément `<spar-natural` :

```html
  <spar-natural 
    src="sparnatural-config.ttl"
    endpoint="https://dbpedia.org/sparql"
    facetedBrowsing="true"
  />
```

### Exemple 1 : filtrage des valeurs dans les listes déroulantes

Considérons l'exemple suivant : les _Lieux_ peuvent avoir un _type_, et les _Lieux_ peuvent être _contenus dans_ d'autres _Lieux_.

Sans le mode de navigation par facettes, si je recherche d'abord les _Lieux_ de type "Rue" ("rue" en français), et que je traverse ensuite le graphe pour sélectionner le type des Lieux "parents" dans lesquels ils sont contenus, j'obtiens la liste complète des valeurs possibles :

![Capture d'écran sans navigation par facettes](/assets/images/faceted-browsing/without-faceted-browsing.png)

Avec le mode de navigation par facettes activé, si je fais la même recherche, seuls les types de Lieux **dans lesquels les Lieux de type "Rue" sont contenus** me seront proposés (ce qui donne seulement 2 valeurs "quartier" et "arrondissement") :

![Capture d'écran avec navigation par facettes](/assets/images/faceted-browsing/with-faceted-browsing.png)

### Exemple 2 : prévention d'un critère de requête

Considérons le même exemple que ci-dessus : les _Lieux_ peuvent avoir un _type_, et les _Lieux_ peuvent être _contenus dans_ d'autres _Lieux_.

Sans le mode de navigation par facettes, si je recherche d'abord les _Lieux_ de type "pays" ("country" en français), et que j'essaie ensuite d'ajouter un critère sur les autres Lieux dans lesquels ils sont contenus, je suis autorisé à le faire :

![Capture d'écran des critères sans navigation par facettes](/assets/images/faceted-browsing/criteria-without-faceted-browsing.png)

Avec le mode de navigation par facettes activé, si j'essaie de faire la même recherche, mon deuxième critère sur les Lieux dans lesquels le pays est contenu sera bloqué, car aucun lieu de type pays n'est contenu dans un autre lieu dans le graphe de connaissances :

![Capture d'écran des critères avec navigation par facettes](/assets/images/faceted-browsing/criteria-with-faceted-browsing.png)


### Fonctionnement

Lorsque la navigation par facettes est activée :
1. Chaque fois qu'une ligne de critère est exprimée, avec son sujet, son prédicat et son objet, une requête SPARQL `ASK` est déclenchée avec la requête complète incluant cette ligne de critère pour s'assurer que des résultats existent. Si ce n'est pas le cas, l'utilisateur est notifié et aucune sélection de valeur ne peut avoir lieu.
1. Chaque source de données SPARQL pour les widgets de liste, d'autocomplétion et d'arbre inclura également la requête SPARQL complète, de sorte que l'ensemble des valeurs retournées corresponde à celles qui ont un sens pour la requête globale.


### Exigences pour les sources de données

Dans les sources de données SPARQL, vous devez vous assurer que **la variable `$this` est utilisée pour représenter le sujet du critère actuel**. Typiquement, la variable `$this` sera typée avec la variable magique `$domain`, et liée à l'ensemble des valeurs possibles avec la variable magique `$property` (voir la [page de configuration des sources de données](datasources-configuration.md) pour plus de détails sur le remplacement des variables dans les sources de données).

Un exemple typique est :

```sparql
SELECT DISTINCT ?uri ?label
WHERE {
    $this $type $domain .
    $this $property ?uri .
    ?uri $labelPath ?label .
    FILTER(isIRI(?uri))
    FILTER(lang(?label) = '' || lang(?label) = $lang)
}
ORDER BY UCASE(STR(?label))
LIMIT 500
```

**La requête SPARQL complète actuelle de Sparnatural sera dynamiquement injectée dans la requête de la source de données à la position de la première occurrence de la variable `$this`.**

En dehors de cette convention de nommage, aucune autre modification n'est requise dans les requêtes des sources de données. Cela signifie que la même source de données peut être utilisée à la fois avec ou sans le mode de navigation par facettes activé.
