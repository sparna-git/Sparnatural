_[Accueil](index.html) > Modèles_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../templates-configuration.md) - le 19/11/2026


# Modèles

## Que sont les modèles ?

Les modèles sont un moyen de personnaliser la manière dont les listes déroulantes, les suggestions d'autocomplétion et les nœuds d'arbre sont affichés. Avec les modèles, toute variable arbitraire retournée par la source de données SPARQL sous-jacente peut être affichée dans un modèle HTML personnalisé, tel qu'une description supplémentaire, les dates de naissance et de décès des personnes, les pays des lieux, etc.

Les modèles peuvent être utilisés :

Dans les widgets de liste :

![Capture d'écran modèle liste](/assets/images/templates/template-list.png)

Dans les widgets d'autocomplétion :

![Capture d'écran modèle autocomplétion](/assets/images/templates/template-autocomplete.png)

Dans les widgets d'arbre :

![Capture d'écran modèle arbre](/assets/images/templates/template-tree.png)


## Comment utiliser les modèles ?

Pour utiliser les modèles, vous devez suivre 3 étapes :

### Étape 1 : enrichir la requête SPARQL de la source de données avec des variables supplémentaires

C'est la source de données SPARQL associée à la propriété dans la configuration qui est responsable de la récupération des informations supplémentaires à afficher dans le modèle. Vous devez simplement retourner des colonnes supplémentaires, avec des noms arbitraires, en plus des colonnes obligatoires (voir la [documentation de configuration des sources de données](datasources-configuration.md)).

Voici un exemple de propriété configurée avec une source de données qui retourne une description supplémentaire :

```turtle
@prefix this: <https://data.mydomain.com/ontologies/sparnatural-config/> .

this:Place_type_list sh:path rico:hasOrHadPlaceType;
  sh:name "place type (list)"@en, "type de lieu (liste)"@fr;
  sh:nodeKind sh:IRI;
  sh:node this:PlaceType;
  dash:searchWidget core:ListProperty;
  datasources:datasource this:list_placetype_definition .

this:list_placetype_definition a datasources:SparqlDatasource;
  datasources:noSort "true"^^xsd:boolean ;
  datasources:queryString """
PREFIX rdf: <http://www.w3.org/1999/02/22-rdf-syntax-ns#>
PREFIX skos: <http://www.w3.org/2004/02/skos/core#>
SELECT ?uri ?count ?description (CONCAT(STR(?theLabel), " (", STR(?count), ")") AS ?label) (STR(?theLabel) AS ?itemLabel) WHERE {
  {
    SELECT ?uri ?count ?theLabel WHERE {
      {
        SELECT DISTINCT ?uri (COUNT(?domain) AS ?count) WHERE {
          ?domain rdf:type $domain;
            $property ?uri.
          FILTER(ISIRI(?uri))
        }
        GROUP BY ?uri
      }
      ?uri skos:prefLabel ?theLabel.
      FILTER(((LANG(?theLabel)) = "") || ((LANG(?theLabel)) = $lang))
    }
    ORDER BY DESC (?count) (UCASE(?theLabel))
    LIMIT 500
  }
  OPTIONAL {
    ?uri skos:definition ?description.
    FILTER(((LANG(?description)) = "") || ((LANG(?description)) = $lang))
  }
}
ORDER BY DESC (?count) (UCASE(STR(?label)))
  """;
```

### Étape 2 : écrire vos modèles

Sparnatural s'appuie sur [handlebars](https://handlebarsjs.com/) pour écrire des modèles. Pour écrire vos modèles, conformément aux recommandations de handlebars, placez-les dans des éléments `<script type="text/x-handlebars-template">` à l'intérieur de l'élément `<spar-natural>`, **avec un identifiant égal à l'URI de la forme de propriété de la config, ou égal à la forme de nœud de plage de la config**. Le widget recherchera un tel modèle, basé sur l'identifiant de la forme de propriété, et l'utilisera s'il en trouve un. Sinon, il appliquera son comportement par défaut.

Le même modèle peut être applicable pour un widget de liste, un widget d'autocomplétion ou un widget d'arbre.

Voici un exemple pour fournir un modèle correspondant à la forme de propriété ci-dessus (remarquez comment l'identifiant de l'élément `<script>` correspond à l'URI de la forme de propriété) :

```html
  <spar-natural (...)>

    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_list"
      type="text/x-handlebars-template"
    >
      <div>
        ici sera le modèle
      </div>
    </script>
  </spar-natural>
```

Pour écrire le contenu du modèle, vous concevez une structure HTML en utilisant [handlebars](https://handlebarsjs.com/), dans laquelle des variables sont insérées. Les modèles ont accès à :
  - variables de niveau supérieur :
    - `term` : valeur précise qui est retournée (URI ou littéral+lang ou littéral+datatype)
    - `label` : libellé d'affichage pour l'élément - peut inclure des informations supplémentaires comme "France (38)"
    - `itemLabel` (optionnel) : libellé pur de la valeur, par exemple "France" pour "France (38)" 
    - `group` (optionnel) : groupe optionnel pour optgroup dans les listes
  - toutes les variables de la requête SPARQL à l'intérieur d'un objet `bindings`.

Les variables ont la même structure que le [format de résultat de requête SPARQL](https://www.w3.org/TR/sparql11-results-json/) (donc avec des champs internes `value`, `xml:lang` ou `datatype`). Donc pour accéder au texte de la variable `?description` de SPARQL, vous écriviez `{{bindings.description.value}}`.

Voici un exemple complet :

```html
  <spar-natural (...)>

    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_list"
      type="text/x-handlebars-template"
    >
        <div class="custom-item-template">
          <b>{{#if itemLabel}}{{itemLabel}}{{else}}{{label}}{{/if}}</b>{{#if
            bindings.count
          }}
            <span
              class="custom-item-count"
            >({{bindings.count.value}})</span>{{/if}}
          <a
            class="custom-item-link"
            href="{{term.value}}"
            target="_blank"
            rel="noopener"
            title="{{term.value}}"
          ></a>
          {{#if bindings.description}}<br /><small
            >{{bindings.description.value}}</small>{{/if}}
        </div>
    </script>
  </spar-natural>
```

Le modèle affiche le libellé de la source de données, le compte s'il est disponible, un lien cliquable externe vers l'URI, et en dessous, à l'intérieur d'un élément `<small>`, une description, si disponible.

### Étape 3 : appliquer des règles CSS personnalisées (optionnel)

Les modèles que vous écrivez peuvent contenir du code HTML arbitraire, y compris des classes CSS arbitraires, sur lesquelles vous pouvez ensuite appliquer des règles CSS personnalisées.

Voici un ensemble complet de classes CSS pour fournir des URI cliquables dans les listes, l'autocomplétion et l'arbre, qui fonctionne avec le modèle ci-dessus :

```html
        <style>
          /* La description doit revenir à la ligne dans la largeur disponible,
                 et non étendre la liste ou dépasser du panneau. */
          .custom-item-template {
            max-width: 100%;
            white-space: normal;
            overflow-wrap: anywhere;
          }
          .custom-item-template small {
            display: -webkit-box;
            -webkit-line-clamp: 4;
            line-clamp: 4;
            -webkit-box-orient: vertical;
            overflow: hidden;
            color: #666;
            line-height: 1.3;
          }

          /* Le lien du modèle, avec sa propre classe : la page ne dépend pas des règles
             de Sparnatural. Masque tant que la ligne n'est pas survolée, opacity et non
             display pour que la place reste réservée et que le libellé ne se décale pas. */
          .custom-item-link {
            display: inline-block;
            width: 12px;
            height: 12px;
            margin-left: 0.35em;
            vertical-align: baseline;
            text-decoration: none;
            cursor: pointer;
            opacity: 0;
            transition: opacity 0.12s;
            background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'%3E%3Cg fill='none' stroke='%2336c' stroke-width='1.3' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='M8.6 6.9v3.3a.8.8 0 0 1-.8.8H1.8a.8.8 0 0 1-.8-.8V4.2a.8.8 0 0 1 .8-.8h3.3'/%3E%3Cpath d='M7.4 1H11v3.6'/%3E%3Cpath d='M11 1 5.4 6.6'/%3E%3C/g%3E%3C/svg%3E") center / 12px 12px no-repeat;
          }
          /* Le :hover couvre la souris, les deux autres classes la ligne mise en avant au
             clavier. Sélecteurs globaux : select2 déplace sa liste déroulante dans le body. */
          .select2-results__option:hover .custom-item-link,
          .select2-results__option--highlighted .custom-item-link,
          .awesomplete > ul > li:hover .custom-item-link,
          .awesomplete > ul > li[aria-selected="true"] .custom-item-link,
          .jstree-anchor:hover .custom-item-link,
          .jstree-hovered .custom-item-link {
            opacity: 0.7;
          }
          /* même spécificité que le bloc ci-dessus : c'est l'ordre qui tranche, garder en dernier */
          .select2-results__option .custom-item-link:hover,
          .awesomplete > ul > li .custom-item-link:hover,
          .jstree-anchor .custom-item-link:hover {
            opacity: 1;
          }

          /* Dans l'arbre, le modèle occupe plusieurs lignes, alors que jstree impose
             24px de hauteur et interdit le retour à la ligne. */
          .tree-widget .treeLayer .treeDisplay:has(.custom-item-template) {
            /* 275px par défaut, trop étroit dès qu'il y a une description */
            min-width: 560px;
          }
          .treeDisplay .jstree-anchor:has(.custom-item-template) {
            display: inline-flex;
            align-items: flex-start;
            white-space: normal;
            height: auto;
            line-height: 1.3;
            padding-block: 2px;
            /* 24px = la flèche de dépliage, qui partage la ligne avec l'ancre */
            max-width: calc(100% - 24px);

            & > .jstree-icon {
              flex: none;
            }
            & .custom-item-template {
              flex: 1;
              min-width: 0;
            }
          }

          /* Awesomplete s'élargit au contenu et refuse le retour à la ligne */
          .awesomplete > ul {
            max-width: 34em;
          }
          .awesomplete > ul > li {
            white-space: normal;
          }
        </style>
```

### Le modèle par défaut

Pour remplacer le modèle par défaut utilisé par Sparnatural, utilisez un modèle avec l'identifiant `default-template` :

```html
        <spar-natural

        >
          <!-- modèle par défaut -->
          <script id="default-template" type="text/x-handlebars-template">
            <span>{{{label}}}</span>
          </script>
        <spar-natural>
```

Cela peut être utile si vous ne souhaitez pas que Sparnatural propose un lien de navigation vers l'URI à partir des listes / autocomplétion ou arbres.


## Exemples de modèles

### Libellé + lien + description

```html
  <spar-natural>

      <script
        id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_autocomplete"
        type="text/x-handlebars-template"
      >
        <div class="custom-item-template">
          <b>{{label}}</b>
          <a
            class="custom-item-link"
            href="{{term.value}}"
            target="_blank"
            rel="noopener"
            title="{{term.value}}"
          ></a>
          {{#if bindings.description}}<br /><small
            >{{bindings.description.value}}</small>{{/if}}
        </div>
      </script>

  </spar-natural>
```

### Libellé + compte + lien + description

```html
  <spar-natural>
    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_list"
      type="text/x-handlebars-template"
    >
      <div class="custom-item-template">
        <b>{{#if itemLabel}}{{itemLabel}}{{else}}{{label}}{{/if}}</b>{{#if
          bindings.count
        }}
          <span
            class="custom-item-count"
          >({{bindings.count.value}})</span>{{/if}}
        <a
          class="custom-item-link"
          href="{{term.value}}"
          target="_blank"
          rel="noopener"
          title="{{term.value}}"
        ></a>
        {{#if bindings.description}}<br /><small
          >{{bindings.description.value}}</small>{{/if}}
      </div>
    </script>
  </spar-natural>
```

### Libellé + description (dans un arbre)


```html
  <spar-natural>

    <script
      id="https://data.mydomain.com/ontologies/sparnatural-config/Place_type_list"
      type="text/x-handlebars-template"
    >
      <div class="custom-item-template">
        <b>{{label}}</b>
        <span
          class="custom-item-link"
          data-href="{{term.value}}"
          title="{{term.value}}"
        ></span>
        {{#if bindings.description}}<br /><small
          >{{bindings.description.value}}</small>{{/if}}
      </div>
    </script>

  </spar-natural>
```
