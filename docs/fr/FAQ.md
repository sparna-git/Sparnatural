_[Accueil](index.html) > FAQ_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../FAQ.md) - le 19/11/2026


# Questions Fréquemment Posées

## Configuration


#### Comment configurer une recherche sur les dates ?

Par défaut, les propriétés avec un `sh:datatype` de `xsd:date`, `xsd:dateTime` ou `xsd:gYear` auront un [widget de calendrier](widgets.html#date-range-widget). Vous pouvez explicitement définir ce widget de calendrier en annotant la forme de propriété avec `config-core:TimeProperty-Date` comme `dash:propertyRole`, par exemple :

```turtle
ex:Person
    a sh:NodeShape ;
    sh:property [
        sh:path foaf:birthDate ;
        sh:name "date de naissance"@fr ;
        dash:propertyRole config-core:TimeProperty-Date ;
    ]
.
```

Il existe également [un type spécial de recherche sur les dates](Querying-date-ranges.html), lorsque les entités recherchées peuvent exprimer soit une date de début + date de fin, soit une date exacte. Sparnatural est capable de générer automatiquement plusieurs clauses UNION pour gérer cette situation.

Pour l'ancienne configuration OWL, voir [issue 314](https://github.com/sparna-git/Sparnatural/issues/314).


#### Comment effectuer une recherche dans le sens inverse ?

Utilisez un chemin de propriété inverse SHACL, par exemple :

```turtle
ex:MyPropertyShape
    sh:path [ sh:inversePath dcterms:subject ] ;
    sh:name "est le sujet de"@fr ;
.
```

#### J'ai besoin de configurer des propriétés inverses, mais cela introduit un cycle dans mon SHACL, comment faire ?

Voici un exemple de cycle où 2 NodeShapes se référencent mutuellement via `sh:node` dans leurs formes de propriété :

```turtle
ex:Group
    a sh:NodeShape ;
    sh:property [
        sh:path foaf:member ;
        sh:name "a comme membre"@fr ;
        sh:node ex:Person ;
    ]
.

ex:Person
    a sh:NodeShape ;
    sh:property [
        sh:path [ sh:inversePath foaf:member ] ;
        sh:name "est membre de"@fr ;
        sh:node ex:Group ;
    ]
.
```

Les cycles dans SHACL ne posent pas de problème pour Sparnatural, mais ils empêchent les validateurs SHACL de valider correctement les données. Vous avez 2 options :
    - briser le cycle en changeant `sh:node` en `sh:class` et en faisant référence à la classe qui est la `sh:targetClass` de l'autre forme. Cela fonctionne uniquement si l'une de vos formes utilise `sh:targetClass`, ce qui n'est pas toujours le cas.
    - créer 2 fichiers SHACL : un fichier SHACL de base pour la validation uniquement, et une extension de celui-ci spécifiquement pour Sparnatural. Retirez la propriété inverse du SHACL de base, et mettez-la dans l'extension spécifique à Sparnatural. Ensuite, passez les deux fichiers SHACL à Sparnatural dans l'attribut `src`, par exemple `<spar-natural src="shacl-base.ttl shacl-extension.ttl">`. De cette façon, le validateur peut fonctionner et Sparnatural peut afficher le chemin inverse.


#### Comment configurer une recherche sur un champ de texte ?

1. Déclarez une NodeShape qui représente vos valeurs littérales, avec un `sh:nodeKind` égal à `sh:Literal`. Vous l'utiliserez comme plage de votre champ :

```turtle
ex:TextValue
    a sh:NodeShape ;
    sh:nodeKind sh:Literal ;
    rdfs:label "Texte"@fr ;
.
```

Utilisez-la comme plage de votre champ de texte, avec un widget `config:SearchProperty` :

```turtle
ex:Museum
    a sh:NodeShape ;
    sh:property [
        sh:path dcterms:description ;
        sh:node ex:TextValue ;
        dash:searchWidget config:SearchProperty ;
        # redondant
        # sh:nodeKind sh:Literal ;
        sh:name "description"@fr ;
    ];
.
```


Pour l'ancienne configuration OWL, voir [issue 309](https://github.com/sparna-git/Sparnatural/issues/309).


#### Comment mapper une classe vers plus d'une classe cible ?

Vous pouvez déclarer plusieurs `sh:targetClass` sur une NodeShape, ou vous pouvez utiliser une cible SPARQL avec une variable `$this` :

```turtle
ex:Organization
    sh:targetClass foaf:Group, foaf:Organization ;
.

ex:Adult
    sh:target [
        sh:select """
            PREFIX foaf: <http://xmlns.com/foaf/0.1/>
            SELECT $this
            WHERE {
                $this a foaf:Person .
                $this foaf:age ?age .
                FILTER(?age > 18) .
            }
        """;
    ] ;
```

Pour l'ancienne configuration OWL, voir [issue 318](https://github.com/sparna-git/Sparnatural/issues/318).


#### Comment définir de jolis préfixes dans la requête SPARQL de sortie ?

Déclarez l'attribut `prefixes` de l'élément `<spar-natural`, voir la [documentation d'intégration HTML](Javascript-integration.html#html-attributes-reference).

#### Comment configurer Sparnatural sur Wikidata ?

Ceci est très expérimental.

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

- Les listes déroulantes ne fonctionnent actuellement pas correctement en raison de la lenteur du service de requête de Wikidata


#### Comment obtenir automatiquement un libellé à afficher lorsque l'utilisateur clique sur l'icône "œil" ?

Vous devez annoter la forme de propriété correspondant au libellé lisible par l'humain de l'entité avec `dash:propertyRole` et la valeur `dash:LabelRole`. Cette propriété peut être marquée `sh:deactivated` si vous ne voulez pas que les utilisateurs recherchent dessus ;

```turtle
ex:Museum
    a sh:NodeShape ;
    sh:property [
        sh:path rdfs:label ;
        # ceci est le libellé lisible par l'humain pour les Musées
        dash:propertyRole dash:LabelRole ;
        # ceci ne s'affichera pas comme un champ de recherche
        sh:deactivated true ;
    ];
.
```

#### Les sources de données par défaut utilisent la fonction `langMatches()` et renvoient des langues en double, est-il possible de changer cela en `lang()` à la place ?

Vous devez créer une source de données personnalisée avec une requête SPARQL personnalisée pour y parvenir. Voir [documentation sur la configuration des sources de données](datasources-configuration.md#votre-propre-requête-sparql-listes--autocomplétion) et voir un exemple à https://github.com/sparna-git/sparnatural.eu/blob/main/demos/demo-smt-cim10/sparnatural-config.ttl#L117


Initialement demandé dans [issue 327](https://github.com/sparna-git/Sparnatural/issues/327).
