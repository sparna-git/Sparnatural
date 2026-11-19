_[Accueil](index.html) > Plugins Sparnatural YASGUI_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../result-display.md) - le 19/11/2026


À strictement parler, le rôle de Sparnatural se limite à produire la requête SPARQL générée par le composant. C'est tout. Il n'est pas responsable de l'affichage des résultats de la requête. Cela relève typiquement de [YasGUI](https://triply.cc/docs/yasgui/), et Sparnatural est donc souvent utilisé en combinaison avec ce dernier composant.

YasGUI offre un rendu de base sous forme de tableau des résultats de requête, ce qui est suffisant pour une intégration simpliste. Cependant, pour un meilleur rendu utilisateur, des plugins spécifiques de YasGUI sont fournis pour être utilisés avec Sparnatural. Ces plugins spécifiques ont [leur propre dépôt Github](https://github.com/sparna-git/Sparnatural-yasgui-plugins) à partir duquel vous pouvez télécharger les versions.

## Plugin "TableX" : masquer les URI derrière les libellés

### Ce qu'il fait


Il s'agit d'une adaptation du plugin YasR Table original. Son amélioration principale est qu'il peut masquer les colonnes URI "derrière" une colonne de libellé correspondante, **masquant ainsi les URI techniques pour les utilisateurs finaux**. Les URL de lien peuvent également être personnalisées pour naviguer vers une URL différente de l'URI originale.

Pour chaque colonne `?xxx_label`, le plugin recherchera une colonne `?xxx` ayant une propriété littérale (par exemple `?Person_1` et `?Person_1_label`), et fusionnera ces colonnes. La fusion est effectuée sur l'ensemble de résultats SPARQL lui-même, en créant un nouveau type de résultat `x-labelled-uri` contenant à la fois l'URI et son libellé. Seule la colonne `?xxx` sera affichée.

Au lieu de ceci :

![YasR sans plugin](/assets/images/yasr-without-plugin.png)

Vous obtiendrez ceci :

![YasR avec plugin](/assets/images/yasr-with-plugin.png)


### Configuration dans Sparnatural

Les libellés par défaut sont configurés avec l'annotation `core:defaultLabelProperty` de la configuration OWL (voir la [référence de configuration OWL](OWL-based-configuration.md)), ou l'annotation équivalente `dash:propertyRole` avec la valeur `dash:LabelRole` de la configuration SHACL (voir la [référence de configuration SHACL](SHACL-based-configuration.md)). Ces annotations provoqueront l'insertion d'une nouvelle colonne dans l'ensemble de résultats, avec un nom de colonne défini sur `xxx_label`, où `xxx` est le nom de la colonne originale ayant une propriété de libellé par défaut (par exemple `?Person_1` et `?Person_1_label`).


### Intégration Javascript

Voir [la section correspondante dans la page d'intégration des plugins](YasGUI-plugins-integration.md#tablex-plugin).

## Plugin "Grid" : cartes fusionnées élégantes, avec images

### Ce qu'il fait

Le plugin Grid fonctionne en conjonction avec Sparnatural, et non pour n'importe quelle requête SPARQL. Il doit être notifié de la requête Sparnatural originale et de la configuration Sparnatural originale.

Le plugin Grid :

- recherche une colonne de titre principal pour chaque entité
- fusionne les lignes dans l'ensemble de résultats ayant le même titre
- affiche les autres colonnes dans chaque carte en répliquant la structure de requête originale de Sparnatural
- peut rechercher une colonne d'image (contenant des URI se terminant par .png ou .jpg)

Voici à quoi cela ressemble avec une colonne d'image sélectionnée :

![Plugin Grid](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/grid-1.png)

La requête originale était la suivante : _(Tous les présidents des groupes politiques de l'UE, avec dates de présidence et image, basées sur les ensembles de données du Portail de données ouvertes du Parlement européen)_

![Requête du plugin Grid](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/grid-3.png)

L'ensemble de résultats original était le suivant - remarquez comment chaque personne est dupliquée autant de fois qu'elle a été présidente d'un groupe, avec des dates différentes :

![Tableau de résultats original du plugin Grid](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/grid-4.png)

Voici un focus sur une carte, remarquez comment les lignes correspondant à la même entité ont été fusionnées, et comment la structure de requête originale est répliquée à l'intérieur de la carte :

![Carte du plugin Grid](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/grid-2.png)

### Configuration dans Sparnatural

_Aucune configuration spécifique nécessaire dans Sparnatural_

### Intégration

Voir [la section correspondante dans la page d'intégration des plugins](YasGUI-plugins-integration.md#grid-plugin).

## Plugin Stats

### Ce qu'il fait

Le plugin Stats peut :
- afficher une simple requête COUNT, avec seulement un résultat entier :

![](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/stats-1.png)

- générer des diagrammes circulaires ou en barres simples à partir d'une requête `COUNT` + `GROUP BY`

![](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/stats-2.png)


![](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/stats-3.png)


### Configuration

Aucune configuration spécifique nécessaire dans Sparnatural, il vous suffit d'émettre une requête "count", typiquement avec d'autres colonnes comme colonnes "group by".

### Intégration

Voir [la section correspondante dans la page d'intégration des plugins](YasGUI-plugins-integration.md#stats-plugin).


## Plugin Map : Points et Polygones

### Ce qu'il fait

Le plugin Map :

- Lit les colonnes avec un type de données `geo:wktLiteral`
- Ou lit 2 colonnes issues d'une propriété dont l'URI contient (en ignorant la casse) `lat` et `long`
- Peut afficher des Points et des Polygones. Les MultiPolygones ne sont actuellement pas pris en charge
- Affiche la zone de requête originale provenant de la requête, si présente
- Affiche des bulles d'information en lisant toutes les colonnes de l'ensemble de résultats
- Divise les polygones en différentes couches selon leur taille, afin que l'utilisateur puisse réduire le nombre de polygones affichés sur la carte pour plus de clarté
- Peut avertir les utilisateurs si certaines lignes de l'ensemble de résultats n'ont pas leurs coordonnées remplies

Voici un exemple :

![Plugin Map](https://github.com/sparna-git/Sparnatural-yasgui-plugins/raw/main/docs/images/map-1.png)

### Configuration

Aucune configuration spécifique nécessaire dans Sparnatural, il vous suffit d'émettre une requête qui soit :
- retourne un `geo:wktLiteral` dans une colonne
- ou retourne 2 colonnes issues de 2 propriétés qui contiennent respectivement `lat` et `long` dans leur URI.

### Intégration

Voir [la section correspondante dans la page d'intégration des plugins](YasGUI-plugins-integration.md#map-plugin).
