_[Accueil](../index.html) > Sparnatural form > pré-remplissage du formulaire_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../../sparnatural-form/form-prefill.md) - le 19/11/2026


# Pré-remplissage de Sparnatural-form avec des paramètres d'URL ou une requête JSON

`<sparnatural-form>` lit l'URL de la page lorsqu'il termine son initialisation, et **pré-remplit ses champs à partir des paramètres d'URL**. Cela vous permet de partager un lien qui ouvre le formulaire avec une recherche prête à l'emploi et l'exécute automatiquement.

Rien n'a besoin d'être ajouté à la page pour cela, ce comportement est intégré à l'élément `<sparnatural-form>` lui-même.

```html
<sparnatural-form
  id="form-productions"
  src="form-configs/performances-shacl.ttl"
  form="form-configs/productions/form.json"
  query="form-configs/productions/query.json"
  endpoint="https://www.performing-arts.ch/sparql"
  lang="en"
></sparnatural-form>
```

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen&Saison=2020
```

> La [liste déroulante de requêtes prédéfinies](form-predefined-queries.md) est une **fonctionnalité distincte**, fournie par l'élément `<sparnatural-form-queries>`. Vous n'avez besoin de cet élément que si vous avez un fichier de requêtes à proposer ; le pré-remplissage par URL fonctionne sans lui.

Il existe **deux manières** de pré-remplir le formulaire à partir de l'URL :

- en passant une **requête JSON complète** dans un seul paramètre `query` (les libellés d'affichage font partie de la requête) ;
- en passant **une valeur brute par variable**, dans une URL plus simple et plus propre, où les libellés d'affichage sont résolus automatiquement.

Si un paramètre `query` est présent, il prend la priorité, et les paramètres par variable sont ignorés.

## Pré-remplissage du formulaire avec une requête JSON

Le paramètre `query` prend une **requête de formulaire** : un objet JSON plat associant chaque variable de formulaire à la valeur à présélectionner. Il s'agit de la structure décrite sur la page [référence JSON de requête Sparnatural-form](form-query.md), la même que celle utilisée comme `values` dans un [fichier de requêtes prédéfinies](form-predefined-queries.md#values).

```json
{
  "RepresentationType": {
    "label": "acoustic",
    "criteria": {
      "rdfTerm": {
        "type": "uri",
        "value": "http://vocab.performing-arts.ch/rtac"
      }
    }
  },
  "UniqueIDValue": {
    "label": "1067",
    "criteria": { "search": "1067" }
  }
}
```

Les tableaux de critères, pour les [champs multi-valeurs](form-query.md#several-values-in-one-field), et les marqueurs `{ "anyValue": true }` / `{ "notExists": true }` [marqueurs](form-query.md#option-markers--unknown-and-any-known-value) sont également acceptés ici. La forme de `criteria` pour chaque widget est documentée dans [Valeurs des critères](../fr/archives/Query-JSON-format-v12.md#criteria-values).

Ce JSON doit être **encodé en URL** et passé comme paramètre `query` :

```
https://search.performing-arts.ch/pages/en/instantiations/?query=%7B%22RepresentationType%22%3A%7B%22label%22%3A%22acoustic%22%2C%22criteria%22%3A%7B%22rdfTerm%22%3A%7B%22type%22%3A%22uri%22%2C%22value%22%3A%22http%3A%2F%2Fvocab.performing-arts.ch%2Frtac%22%7D%7D%7D%2C%22UniqueIDValue%22%3A%7B%22label%22%3A%221067%22%2C%22criteria%22%3A%7B%22search%22%3A%221067%22%7D%7D%7D
```

Si un JSON invalide est passé, une erreur est enregistrée dans la console et aucun pré-remplissage n'a lieu.

Ce mode vous donne un contrôle total sur les critères et les libellés affichés, au prix d'une URL longue. Il **ne soumet pas** automatiquement le formulaire, le paramètre `exec` ne s'applique qu'au mode par variable ci-dessous.

## Nom du paramètre = variable du formulaire

En mode par variable, chaque paramètre de requête d'URL (sauf les réservés) est interprété comme un **champ de formulaire à pré-remplir**. Le **nom** du paramètre est la `variable` du champ, telle que déclarée dans la [spécification du formulaire](form-configuration.md), et la **valeur** du paramètre est la valeur à injecter.

Par exemple, le formulaire _Productions_ de SAPA déclare les variables `Title` et `Saison` :

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen&Saison=2020
```

ouvre le formulaire avec le champ `Title` rempli avec `Carmen` et le champ `Saison` rempli avec `2020`.

Vous pouvez passer autant de paramètres que vous le souhaitez. Un paramètre dont le nom ne correspond à aucune variable de formulaire est simplement ignoré, avec un avertissement dans la console.

Le nom du paramètre est mis en correspondance avec les variables du formulaire **de manière insensible à la casse** : `?title=Carmen` et `?TITLE=Carmen` remplissent tous deux le champ `Title`. Une correspondance exacte l'emporte toujours sur une correspondance insensible à la casse.

**Noms de paramètres réservés**, jamais traités comme des champs de formulaire :

| Paramètre | Rôle                                                                     |
| --------- | ------------------------------------------------------------------------ |
| `query`   | Le [mode de requête JSON complète](#pré-remplissage-du-formulaire-avec-une-requête-json).          |
| `exec`    | [Soumission automatique](#paramètre-exec--soumission-automatique-après-le-pré-remplissage-par-url) switch. |
| `lang`    | Langue au niveau de la page, laissée à la page hôte.                           |

## Valeurs des paramètres

La syntaxe de la valeur dépend du **widget** configuré pour le champ dans la [configuration Sparnatural](../fr/SHACL-based-configuration.md). Chaque widget analyse lui-même la chaîne brute, vous n'avez donc qu'à écrire la valeur dans son propre format et le formulaire construit les critères correspondants et leur libellé d'affichage.

Les valeurs doivent être **encodées en URL**, comme toujours.

### IRI (Widgets Liste, Autocomplétion et Arbre)

Pour les champs qui prennent une IRI comme valeur, passez **l'IRI encodée en URL**.

```
https://search.performing-arts.ch/pages/en/instantiations/?RepresentationType=http%3A%2F%2Fvocab.performing-arts.ch%2Frtac
```

Le libellé de cette IRI est **récupéré automatiquement** depuis le point d'accès, de sorte que le champ affiche _"acoustic"_ plutôt que l'IRI brute. Le libellé est recherché avec la propriété de libellé configurée pour la classe du champ, sa `defaultLabelProperty` si elle en déclare une, sinon `skos:prefLabel` pour un concept SKOS, sinon `rdfs:label|skos:prefLabel`.

La langue utilisée est celle de l'**attribut `lang`** de `<sparnatural-form>`, en retombant sur son **attribut `defaultLang`**. Si aucun libellé ne peut être résolu (IRI inconnue, aucun libellé dans l'une ou l'autre langue, point d'accès inaccessible), le champ retombe sur l'affichage de l'IRI elle-même, et le critère est toujours appliqué.

Parce que cette recherche est une requête SPARQL, les champs IRI sont les seuls à se résoudre de manière asynchrone ; la soumission automatique attend que tous soient prêts avant d'exécuter la recherche.

### Dates (Widgets Date et Année)

Passez une plage sous la forme **`début|fin`**, les deux bornes étant séparées par un pipe. Chaque borne peut être une année ou une date ; l'une ou l'autre peut être laissée vide pour une plage ouverte.

```
https://example.org/search?CreationYear=1800%7C1901
https://example.org/search?CreationDate=2020-05-12%7C2020-06-30
https://example.org/search?CreationYear=1900%7C
https://example.org/search?CreationYear=%7C1950
```

Sur un widget **année**, les bornes sont élargies à toute l'année : `1800|1901` couvre du 1800-01-01 au 1901-12-31. Les années négatives sont prises en charge (`-500|-200`).

Si aucune des bornes n'est une date valide, ou si le début est postérieur à la fin, une erreur est enregistrée et le champ est laissé vide.

### Nombre (Widget Nombre)

Passez une plage sous la forme **`min|max`**, même syntaxe avec pipe que pour les dates. L'une ou l'autre borne peut être laissée vide.

```
https://example.org/search?Size=10000%7C100000
https://example.org/search?Size=10000%7C
https://example.org/search?Size=%7C100000
```

Une valeur sans pipe est lue comme le **minimum** seulement : `?Size=10000` signifie "au moins 10000".

### Carte (Widget Carte)

Passez une liste de points sous la forme **`lat,lng;lat,lng;…`** : les points séparés par des points-virgules, la latitude et la longitude séparées par une virgule.

- **deux points** sont lus comme deux coins opposés d'un **rectangle** ;
- **trois points ou plus** sont lus comme les sommets d'un **polygone**.

```
https://example.org/search?Place=46.9%2C7.4%3B47.5%2C8.6
https://example.org/search?Place=46.9%2C7.4%3B47.5%2C8.6%3B47.1%2C9.2
```

Au moins deux points sont requis ; une coordonnée mal formée enregistre une erreur et laisse le champ vide.

### Booléen (Widget Booléen)

Passez `true` ou `1` pour vrai. Toute autre valeur est lue comme fausse.

```
https://example.org/search?IsDigitized=true
```

### Texte (Widgets de recherche)

Passez le texte de recherche tel quel. Il est utilisé exactement tel que tapé, sans analyse.

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen
https://search.performing-arts.ch/pages/en/instantiations/?UniqueIDValue=1067
```

### Valeurs spéciales : "Inconnu" et "N'importe quelle valeur connue"

Deux mots-clés réservés pré-sélectionnent les options _"Inconnu"_ et _"N'importe quelle valeur connue"_ d'un champ, au lieu d'une valeur réelle. Ils fonctionnent sur n'importe quel widget.

| Mot-clé   | Effet                                                                                               |
| --------- | ---------------------------------------------------------------------------------------------------- |
| `UNKNOWN` | Coche l'option **"Inconnu"** du champ (la valeur ne doit pas exister, un `FILTER NOT EXISTS` en SPARQL). |
| `ANY`     | Coche l'option **"N'importe quelle valeur connue"** du champ (la valeur peut être n'importe quoi, tant qu'elle existe).    |

Les deux mots-clés sont **insensibles à la casse** (`UNKNOWN`, `unknown` et `Unknown` fonctionnent tous).

```
https://search.performing-arts.ch/pages/en/productions/?Saison=UNKNOWN
```

ouvre le formulaire avec le champ `Saison` défini sur _"Inconnu"_.

Ces options n'existent que sur les champs qui sont déclarés optionnels dans la requête sous-jacente. Si un champ n'a pas une telle option, le mot-clé est ignoré et un avertissement est enregistré dans la console. Leurs équivalents en mode JSON sont les [marqueurs `anyValue` / `notExists`](form-query.md#option-markers--unknown-and-any-known-value).

## Passage de plusieurs valeurs à un seul champ

Certains champs sont configurés pour accepter **plus d'une valeur** (multi-valeurs). Pour pré-remplir un tel champ avec plusieurs valeurs, **répétez le paramètre** :

Sur le formulaire _Productions_ de SAPA, `TypeActor` (_Type d'agent_) accepte plusieurs valeurs :

```
https://search.performing-arts.ch/pages/en/productions/?TypeActor=http%3A%2F%2Fwww.cidoc-crm.org%2Fcidoc-crm%2FE74_Group&TypeActor=http%3A%2F%2Fwww.cidoc-crm.org%2Fcidoc-crm%2FE40_Legal_Body
```

Cela ouvre le formulaire avec le champ `TypeActor` contenant les deux valeurs, _Group_ et _Legal Body_.

Chaque valeur répétée est interprétée individuellement, selon la syntaxe du widget du champ ci-dessus. Si le champ est configuré pour accepter uniquement **une** valeur, les valeurs supplémentaires sont ignorées et un avertissement est affiché à côté du champ ; les valeurs ne sont empilées que sur les champs multi-valeurs.

## Paramètre `exec` (Soumission automatique après le pré-remplissage par URL)

Lorsque le formulaire est pré-rempli à partir des paramètres d'URL par variable, il est **soumis automatiquement** une fois le pré-remplissage terminé, y compris la résolution asynchrone des libellés des champs IRI, de sorte qu'un lien partagé montre directement les résultats sans que l'utilisateur n'ait à cliquer sur le bouton de recherche.

Pour pré-remplir le formulaire **sans** le soumettre, par exemple pour laisser l'utilisateur examiner ou ajuster les critères d'abord, ajoutez `exec=false` :

```
https://search.performing-arts.ch/pages/en/productions/?Title=Carmen&Saison=2020&exec=false
```

Toute autre valeur de `exec`, ou son absence, conserve le comportement par défaut et soumet le formulaire.

> La soumission automatique s'applique uniquement au **mode par variable** de l'URL. Le [paramètre `query`](#pré-remplissage-du-formulaire-avec-une-requête-json) et la [liste déroulante de requêtes prédéfinies](form-predefined-queries.md) pré-remplissent le formulaire sans le soumettre : l'utilisateur déclenche lui-même la recherche.

## Plusieurs formulaires sur la même page

Une seule page peut héberger plusieurs éléments `<sparnatural-form>` indépendants. **Chacun lit la même URL de la page** et sélectionne les paramètres qui correspondent à ses propres champs ; les paramètres qui ne correspondent à aucune variable d'un formulaire sont ignorés par ce formulaire.

Ainsi, sur une page multi-formulaires, assurez-vous que les formulaires ne partagent pas de noms de variables, sauf si vous souhaitez effectivement qu'un seul paramètre remplisse les deux.

## Voir aussi

- [Référence JSON de requête de formulaire](form-query.md) - la structure prise par le paramètre `query`
- [Liste déroulante de requêtes prédéfinies](form-predefined-queries.md) - offrant des requêtes prêtes à l'emploi dans une liste déroulante
- [Référence JSON de configuration de formulaire](form-configuration.md) - où les variables de formulaire sont déclarées
