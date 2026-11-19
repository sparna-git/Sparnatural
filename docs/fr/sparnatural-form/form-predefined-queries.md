_[Accueil](../index.html) > Sparnatural form > requêtes prédéfinies_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../../sparnatural-form/form-predefined-queries.md) - le 19/11/2026


# Liste déroulante de requêtes prédéfinies : `<sparnatural-form-queries>`

`<sparnatural-form-queries>` affiche une **liste déroulante de requêtes exemples prêtes à l'emploi** au-dessus d'un `<sparnatural-form>`. Lorsque l'utilisateur choisit une entrée, le formulaire est pré-rempli avec ses valeurs.

```html
<sparnatural-form-queries
  src="form-configs/productions/query-remp.json"
  lang="en"
  for="form-productions"
></sparnatural-form-queries>

<sparnatural-form
  id="form-productions"
  src="form-configs/performances-shacl.ttl"
  form="form-configs/productions/form.json"
  query="form-configs/productions/query.json"
  endpoint="https://www.performing-arts.ch/sparql"
  lang="en"
></sparnatural-form>
```

> Les exemples de cette page sont tirés du [site de recherche SAPA](https://search.performing-arts.ch), dont le formulaire _Productions_ propose une telle liste déroulante.

Le composant est rendu **à l'extérieur** de l'élément `<sparnatural-form>`, de sorte que vous pouvez le positionner et le styliser indépendamment du formulaire.

> Ce composant ne concerne que la liste déroulante. **Le pré-remplissage d'un formulaire à partir de l'URL de la page est géré par `<sparnatural-form>` lui-même** et ne nécessite aucun élément supplémentaire (voir [Pré-remplissage depuis l'URL](form-prefill.md)). Ajoutez `<sparnatural-form-queries>` uniquement lorsque vous avez effectivement un fichier de requêtes à proposer.

La sélection d'une entrée pré-remplit le formulaire mais **ne le soumet pas** : l'utilisateur passe en revue les critères et exécute la recherche lui-même.

## Attributs

| Attribut | Description                                                                                             | Valeur par défaut             |
| --------- | ------------------------------------------------------------------------------------------------------- | ------------------------------ |
| `src`     | URL du fichier JSON des requêtes prédéfinies. **Obligatoire** : sans lui, le composant n'a rien à afficher. | aucun                          |
| `for`     | `id` du formulaire `<sparnatural-form>` cible. Si omis, le formulaire unique sur la page est utilisé.               | formulaire unique sur la page |
| `lang`    | Langue de l'espace réservé de la liste déroulante et des [libellés par langue du fichier](#file-format).              | `en`                          |

Le composant résout son formulaire cible même s'il est déclaré **avant** ce formulaire dans le HTML.

Si aucun formulaire cible ne peut être trouvé, ou si `src` est manquant, une erreur est enregistrée dans la console et aucune liste déroulante n'est rendue.

## Format du fichier

Le fichier `src` est un objet JSON avec un seul tableau `queries`. Chaque entrée contient :

- `label` : le texte affiché dans la liste déroulante ;
- `values` : les valeurs à pré-remplir, indexées par la **variable du formulaire** (les mêmes noms de `variable` déclarés dans la [spécification du formulaire](form-configuration.md)).

```json
{
  "queries": [
    {
      "label": { "fr": "Productions", "en": "Productions" },
      "values": {
        "Activity_Type_22": {
          "label": "production",
          "criteria": {
            "rdfTerm": {
              "type": "uri",
              "value": "http://vocab.performing-arts.ch/muwgo"
            }
          }
        }
      }
    },
    {
      "label": "Productions de la saison 2020",
      "values": {
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
    }
  ]
}
```

### `label`

Un `label` est soit une chaîne de caractères simple, soit un objet avec une entrée par code de langue. Lorsqu'il s'agit d'un objet, l'attribut [`lang`](#attributes) choisit la langue, en retombant sur `en` puis sur la première entrée disponible. Dans l'exemple ci-dessus, la première requête utilise un libellé par langue et la seconde une chaîne simple.

### `values`

`values` est une **requête de formulaire** : un objet plat avec une clé par champ de formulaire. Sa référence complète se trouve sur la page [référence JSON de requête de formulaire](form-query.md) : la paire `{ label, criteria }`, la forme `criteria` de chaque widget, les tableaux pour les champs multi-valeurs, et les marqueurs `{ "anyValue": true }` / `{ "notExists": true }`.

En résumé :

```json
"values": {
  "Saison": { "label": "2020", "criteria": { "search": "2020" } },
  "TypeActor": [
    { "label": "Group", "criteria": { "rdfTerm": { "type": "uri", "value": "http://www.cidoc-crm.org/cidoc-crm/E74_Group" } } },
    { "label": "Legal Body", "criteria": { "rdfTerm": { "type": "uri", "value": "http://www.cidoc-crm.org/cidoc-crm/E40_Legal_Body" } } }
  ],
  "Title": { "notExists": true }
}
```

La sélection de l'entrée réinitialise le formulaire, puis applique exactement ces valeurs : les champs absents de `values` sont laissés vides.

## Plusieurs formulaires sur la même page

Une seule page peut héberger plusieurs éléments `<sparnatural-form>` indépendants. Donnez à chaque formulaire un `id`, et ajoutez un `<sparnatural-form-queries>` par formulaire ayant besoin d'une liste déroulante, chacun pointant vers son formulaire via `for` :

```html
<sparnatural-form-queries
  src="form-configs/productions/query-remp.json"
  for="form-productions"
></sparnatural-form-queries>
<sparnatural-form id="form-productions" ...></sparnatural-form>

<sparnatural-form-queries
  src="form-configs/instantiations/query-remp.json"
  for="form-instantiations"
></sparnatural-form-queries>
<sparnatural-form id="form-instantiations" ...></sparnatural-form>
```

Un formulaire qui n'a pas besoin de liste déroulante n'obtient simplement aucun composant :

```html
<sparnatural-form id="form-agents" ...></sparnatural-form>
```

Sans `for`, un composant retombe sur le formulaire **unique** de la page ; sur une page multi-formulaires, il entraînerait alors le mauvais formulaire. Définissez toujours `for` lorsqu'il y a plus d'un formulaire présent.

## Voir aussi

- [Référence JSON de requête de formulaire](form-query.md) - la structure complète de `values`
- [Pré-remplissage avec des paramètres d'URL ou une requête JSON](form-prefill.md) - l'autre façon de pré-remplir un formulaire, gérée par `<sparnatural-form>` lui-même
- [Référence JSON de configuration de formulaire](form-configuration.md) - où les variables de formulaire sont déclarées
