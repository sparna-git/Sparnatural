_[Accueil](index.html) > Affichage des résultats_

# Vues de résultats LDForge

Sparnatural construit une requête ; l'intégration LDForge optionnelle permet de
modifier le SPARQL, de l'exécuter et d'afficher les résultats. Consultez le
[guide LDForge](LDForge-integration.md) pour l'installation et la
[référence historique](archives/result-display-yasgui.md) pour une application
Yasgui existante. Les deux API de plugins ne sont pas interchangeables.

## Tableau avec libellés

**Labelled table** (`tablex`) affiche `?x_label` à la place de `?x` quand les deux
colonnes sont présentes. La colonne de libellé est masquée, mais le lien HTTP(S)
de la ressource est conservé. Les en-têtes peuvent utiliser les libellés de la
configuration. Le tableau permet le tri et le filtrage.

```sparql
SELECT ?person ?person_label WHERE {
  VALUES (?person ?person_label) {
    (<https://example.org/alice> "Alice")
    (<https://example.org/bob> "Bob")
  }
}
```

Configurez `dash:LabelRole` en SHACL (ou `core:defaultLabelProperty` dans une
ancienne configuration OWL) pour générer les colonnes de libellé.
`resultOptions.uriHrefAdapter` personnalise les liens sans modifier les valeurs
originales du JSON ou du CSV.

## Grid

**Grid** (`grid`) est la vue d'entités propre à Sparnatural. Elle regroupe les
lignes par terme RDF racine et conserve les branches imbriquées de la requête
visuelle : une relation et sa date restent rattachées au même parent. Deux IRI
avec le même libellé restent deux entités. Les propriétés utilisent les libellés
de la configuration ; les colonnes supplémentaires restent affichées. Une URL
d'image HTTP(S) avec une extension courante peut illustrer la carte.

L'intégration transmet automatiquement les métadonnées, en JSON v13 ou ancien
format. Il n'est plus nécessaire d'appeler `notifyQuery()` ou
`notifyConfiguration()`. Si la racine n'est pas sélectionnée, la première
variable affichée sert au regroupement et la présentation est plate. Les
variables intermédiaires absentes ne permettent pas d'identifier les entités
liées, mais leurs descendants sélectionnés restent visibles. Après modification
manuelle du SPARQL, Grid utilise une présentation plate.

Le regroupement ne modifie jamais les lignes du résultat original ou du CSV.
Grid et Labelled table affichent toutes les lignes ; utilisez LIMIT pour les
jeux volumineux. Le style exact et les icônes de l'ancien Grid ne sont pas repris.

## Cards

**Cards** (`cards`) est la grille générique de LDForge : une carte par ligne,
sans regroupement d'entités. Les variables reconnues sont `card_title`,
`card_text`, `card_image`, `card_button` et `card_button_url`.
Au moins une doit être sélectionnée. Chaque champ est optionnel par ligne ;
un bouton nécessite son texte et son URL.

```sparql
# view=cards
SELECT ?card_title ?card_text WHERE {
  VALUES (?card_title ?card_text) { ("Alice" "Premier exemple") }
}
```

## Carte géographique

**Map** (`geo`) reconnaît les littéraux `geo:wktLiteral` et les colonnes de
latitude/longitude d'après leurs noms ou les propriétés configurées. Une requête
manuelle peut fournir `geometry`, `geometryLabel`, `geoImage`, `geoDescription`
et `geoLink`.

```sparql
# view=geo
SELECT ?geometry ?geometryLabel WHERE {
  VALUES (?geometry ?geometryLabel) { ("POINT(4.9 52.37)" "Amsterdam") }
}
```

Les coordonnées sont WGS84, longitude en premier. Points, lignes, polygones et
variantes multiples sont disponibles, avec des modes normal, groupé, densité et
3D. Les géométries invalides sont signalées. La zone recherchée superposée et les
couches classées par taille de l'ancien plugin ne sont pas reprises. Utilisez
`resultOptions.geo` pour configurer les bibliothèques, les styles et les tuiles.

## Graphiques

**Charts** (`charts`) adapte le premier agrégat COUNT sélectionné dans la requête
visuelle et utilise les autres colonnes pour les catégories. Un COUNT seul
apparaît comme une barre. Pour une requête manuelle :

```sparql
# view=charts; chart=bar
SELECT ?chart_label ?chart_value WHERE {
  VALUES (?chart_label ?chart_value) { ("A" 2) ("B" 3) }
}
```

Les types disponibles sont barres, lignes, secteurs et anneaux. Les vues numérique
isolée et polaire de l'ancien Stats ne sont pas reprises. Chart.js est chargé à
l'activation ; `resultOptions.charts` permet un chargeur personnalisé.

## Table native, JSON et CSV

**Table** (`table`) offre les détails RDF et l'inspection des ressources.
**JSON** (`json`) affiche les résultats normalisés, sans reproduire la réponse
HTTP brute. ASK utilise la vue booléenne ; les résultats de graphe nécessitent un
transport adapté. Le CSV télécharge les données originales complètes, indépendamment
du regroupement visuel de Grid.

Les messages de Labelled table et Grid sont actuellement en anglais. Les contrôles
natifs LDForge sont disponibles en anglais et néerlandais ; les libellés de la
configuration Sparnatural conservent leur langue. Consultez la
[référence LDForge](https://github.com/mightymax/ldforge/blob/main/docs/renderers.md)
pour les contrats complets et les options d'hébergement des bibliothèques.
