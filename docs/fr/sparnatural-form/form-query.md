_[Accueil](../index.html) > Sparnatural form > requête JSON du formulaire_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../../sparnatural-form/form-query.md) - le 19/11/2026


# Référence JSON de requête Sparnatural-form

Une **requête de formulaire** est un petit objet JSON décrivant un ensemble de valeurs à placer dans les champs d'un formulaire Sparnatural. C'est ce avec quoi le formulaire est pré-rempli, et la même structure est acceptée en trois endroits :

- les `values` d'une entrée d'un [fichier de requêtes prédéfinies](form-predefined-queries.md) (généralement `query-remp.json`) ;
- le paramètre `query` [d'URL](form-prefill.md#pré-remplissage-du-formulaire-avec-une-requête-json) ;
- la méthode `loadQuery()` de l'élément `<sparnatural-form>`.

> **Pas la même chose que l'attribut `query`** de `<sparnatural-form>`. Cet attribut pointe vers la requête Sparnatural complète que le formulaire *exécute*, au [format de requête v12](../fr/archives/Query-JSON-format-v12.md). La requête de formulaire décrite ici est la petite structure plate utilisée pour *remplir* le formulaire.

## Structure

Une clé par champ de formulaire, sans imbrication. Celle-ci pré-remplit deux champs du formulaire _Productions_ de SAPA :

```json
{
  "Activity_Type_22": {
    "label": "production",
    "criteria": {
      "rdfTerm": {
        "type": "uri",
        "value": "http://vocab.performing-arts.ch/muwgo"
      }
    }
  },
  "Saison": {
    "label": "2020",
    "criteria": { "search": "2020" }
  }
}
```

Chaque **clé** est une variable de formulaire, telle que déclarée dans le `variable` d'une liaison de la [spécification du formulaire](form-configuration.md). Les clés sont mises en correspondance **de manière insensible à la casse** (une correspondance exacte l'emporte), et une clé ne correspondant à aucun champ de formulaire est ignorée avec un avertissement dans la console.

Chaque **valeur** est l'une des trois choses suivantes :

| Valeur                                                           | Effet                                                     |
| --------------------------------------------------------------- | ---------------------------------------------------------- |
| un [critère étiqueté](#critère-étiqueté)                        | remplit le champ avec une valeur                             |
| un [tableau de critères étiquetés](#plusieurs-valeurs-dans-un-champ)    | remplit un champ multi-valeurs avec plusieurs valeurs              |
| un [marqueur d'option](#marqueurs-doption--inconnu-et-nimporte-quelle-valeur-connue) | coche l'option _"Inconnu"_ / _"N'importe quelle valeur connue"_ du champ |

Le chargement d'une requête de formulaire **réinitialise toujours tout le formulaire d'abord**, donc l'état résultant est exactement ce que décrit l'objet : les champs non mentionnés sont laissés vides.

## Critère étiqueté

Une seule valeur est une paire `{ label, criteria }` :

```json
{ "label": "2020", "criteria": { "search": "2020" } }
```

- `label` : le texte affiché dans le champ. Il est utilisé tel quel : dans une requête de formulaire, les libellés **ne sont pas** résolus automatiquement, contrairement aux [paramètres d'URL par variable](form-prefill.md#paramètre-values). Fournissez toujours un libellé, sinon le champ montre une valeur vide.
- `criteria` : la valeur elle-même. Sa forme dépend du **widget** configuré pour le champ.

Il s'agit exactement du critère étiqueté de la requête Sparnatural sous-jacente, les mêmes objets qui vont dans le tableau `criterias` d'une ligne de requête. Plutôt que de les répéter ici, voir la référence du format de requête v12 :

- [Critères étiquetés](../fr/archives/Query-JSON-format-v12.md#labelled-criterias) - la paire `{ label, criteria }`
- [Valeurs des critères](../fr/archives/Query-JSON-format-v12.md#criteria-values) - la forme de `criteria` pour chaque widget : `rdfTerm` (URI, ou littéral avec une langue ou un type de données), `start`/`stop` pour les dates, `min`/`max` pour les nombres, `boolean`, `search`, et `coordType`/`coordinates` pour les cartes

## Plusieurs valeurs dans un champ

Certains champs acceptent **plus d'une valeur**. Passez un tableau de critères étiquetés :

```json
{
  "TypeActor": [
    {
      "label": "Group",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E74_Group"
        }
      }
    },
    {
      "label": "Legal Body",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E40_Legal_Body"
        }
      }
    }
  ]
}
```

Si le champ n'accepte qu'**une** seule valeur, les valeurs supplémentaires sont ignorées.

## Marqueurs d'option : "Inconnu" et "N'importe quelle valeur connue"

Au lieu d'une valeur, un champ peut être défini sur l'une de ses deux options :

```json
{ "Saison": { "notExists": true } }
```

| Marqueur                  | Effet                                                                  |
| ----------------------- | ----------------------------------------------------------------------- |
| `{ "notExists": true }` | Coche l'option **"Inconnu"** du champ (`FILTER NOT EXISTS` en SPARQL). |
| `{ "anyValue": true }`  | Coche l'option **"N'importe quelle valeur connue"** du champ.                         |

`notExists` l'emporte si les deux sont définis. Les équivalents URL sont les [mots-clés `UNKNOWN` et `ANY`](form-prefill.md#valeurs-spéciales--inconnu-et-nimporte-quelle-valeur-connue).

Ces options n'existent que sur les champs dont la branche est déclarée `optional` dans la requête que le formulaire exécute. Si un champ n'a pas une telle option, le marqueur est ignoré et un avertissement est enregistré dans la console.

## Exemple complet

```json
{
  "Activity_Type_22": {
    "label": "production",
    "criteria": {
      "rdfTerm": {
        "type": "uri",
        "value": "http://vocab.performing-arts.ch/muwgo"
      }
    }
  },
  "TypeActor": [
    {
      "label": "Group",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E74_Group"
        }
      }
    },
    {
      "label": "Legal Body",
      "criteria": {
        "rdfTerm": {
          "type": "uri",
          "value": "http://www.cidoc-crm.org/cidoc-crm/E40_Legal_Body"
        }
      }
    }
  ],
  "Title": {
    "label": "Carmen",
    "criteria": { "search": "Carmen" }
  },
  "Saison": { "notExists": true }
}
```

Quatre champs du formulaire _Productions_ de SAPA : une URI unique, deux valeurs dans un champ multi-valeurs, une recherche en texte libre, et une option _"Inconnu"_.

## Voir aussi

- [`<sparnatural-form-queries>`](form-predefined-queries.md) - où cette structure est utilisée comme `values`
- [Pré-remplissage avec des paramètres d'URL ou une requête JSON](form-prefill.md) - où elle est utilisée comme paramètre `query`, et l'alternative plus simple par variable
- [Format de requête JSON v12](../fr/archives/Query-JSON-format-v12.md) - la référence des critères, et le format de l'attribut `query`
- [Référence JSON de configuration de formulaire](form-configuration.md) - où les variables de formulaire sont déclarées
