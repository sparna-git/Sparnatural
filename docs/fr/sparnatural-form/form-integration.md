_[Accueil](../index.html) > Sparnatural form > intégration du formulaire_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../../sparnatural-form/form-integration.md) - le 19/11/2026


# Intégration de Sparnatural Form et référence des paramètres

## Constructeur

Sparnatural Form s'insère sous forme d'élément HTML personnalisé nommé `sparnatural-form`, avec des attributs spécifiques. Il se présente comme suit :

```html
<sparnatural-form
  src="sparnatural-config.ttl"
  form="form-specification.json"
  query="form-query.json"
  endpoint="https://dbpedia.org/sparql"
  lang="en"
  defaultLang="en"
  limit="1000"
  debug="true"
/>
```

## Référence des attributs HTML

En résumé, Sparnatural Form nécessite 4 éléments à configurer :

- Une structure de `query` Sparnatural qui sera exécutée lorsque le formulaire est soumis. Cette structure de requête peut être arbitrairement complexe, bien que l'utilisateur ne verra qu'un formulaire plat et simple.
- Une spécification de `form`, qui lie les variables de la `query` aux champs du formulaire. Lorsque l'utilisateur sélectionne une valeur pour un certain champ, la valeur est injectée dans la variable correspondante dans la requête.
- La configuration `src` donnant la structure sous-jacente du graphe de connaissances et la configuration Sparnatural. En particulier, cela contiendra la configuration des widgets utilisée dans le formulaire
- Le point d'accès `endpoint` contre lequel les requêtes sont exécutées.

| Attribut       | Description                                                                                                                                                                                                                                                            | Valeur par défaut | Obligatoire/Optionnel |
| --------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------- | --------------------- |
| `src`           | identique à l'attribut équivalent [de Sparnatural](../fr/Javascript-integration.md)                                                                                                                                                                                      | `undefined` | Obligatoire          |
| `endpoint`      | identique à l'attribut équivalent [de Sparnatural](../fr/Javascript-integration.md)                                                                                                                                                                                      | `undefined` | Obligatoire          |
| `form`          | URL d'un fichier JSON donnant la spécification des champs du formulaire, suivant la [structure de spécification du formulaire](form-configuration.md)                                                                                                                                    | `undefined` | Obligatoire          |
| `query`         | URL d'un fichier JSON donnant la structure de la requête finale que le formulaire exécutera, avec les variables liées aux valeurs fournies dans le formulaire. Ce fichier suit la [structure de requête Sparnatural v12](../fr/archives/Query-JSON-format-v12.md) (`branches` / `line`). | `undefined` | Obligatoire          |
| `catalog`       | identique à l'attribut équivalent [de Sparnatural](../fr/Javascript-integration.md)                                                                                                                                                                                      | aucun        | Optionnel           |
| `defaultLang`   | identique à l'attribut équivalent [de Sparnatural](../fr/Javascript-integration.md)                                                                                                                                                                                      | `en` | Recommandé |
| `lang`          | identique à l'attribut équivalent [de Sparnatural](../fr/Javascript-integration.md)                                                                                                                                                                                      | `en` | Recommandé |
| `limit`         | identique à l'attribut équivalent [de Sparnatural](../fr/Javascript-integration.md)                                                                                                                                                                                      | `-1`        | Optionnel           |
| `prefixes`      | identique à l'attribut équivalent [de Sparnatural](../fr/Javascript-integration.md)                                                                                                                                                                                      | `aucun`      | Optionnel           |
| `typePredicate` | Le prédicat de type à utiliser pour générer le critère de type. Par défaut rdf:type, mais pourrait être changé par exemple en `<http://www.wikidata.org/prop/direct/P31>+` pour l'intégration avec Wikidata, ou `<http://www.w3.org/2000/01/rdf-schema#subClassOf>+` pour interroger des modèles de style OWL.  | `rdf:type`  | Optionnel           |

## Événements de Sparnatural Form

### Événement "queryUpdated"

L'événement `queryUpdated` est déclenché chaque fois que la requête est modifiée. Le détail de l'événement contient :

- La chaîne SPARQL dans `queryString`
- La structure JSON Sparnatural dans `queryJson`

```javascript
sparnaturalForm.addEventListener("queryUpdated", (event) => {
  console.log(event.detail.queryString);
  console.log(event.detail.queryJson);
});
```

### Événement "submit"

L'événement `submit` est déclenché lorsque le bouton de recherche/export est cliqué.

Dans les intégrations typiques, l'état du bouton de soumission peut être mis à jour lors de la soumission. Le bouton de soumission peut être « non chargé et actif », « en chargement » ou « désactivé ». Les fonctions pour mettre à jour l'état du bouton sont :

- `sparnaturalForm.disablePlayBtn()`
- `sparnaturalForm.enablePlayBtn()`

`disablePlayBtn()` doit être appelé lors de l'événement submit et `enablePlayBtn()` lorsque la requête a retourné des résultats.

### Événement "init"

L'événement `init` est déclenché lorsque le formulaire Sparnatural a terminé son initialisation.

Voir [l'événement correspondant dans Sparnatural](../fr/Javascript-integration.html#init-event).

### Événement "reset"

L'événement `reset` est déclenché lorsque le bouton de réinitialisation est cliqué. Il peut être utilisé pour vider ou réinitialiser d'autres parties de la page, typiquement YasQE.

Voir [l'événement correspondant dans Sparnatural](../fr/Javascript-integration.html#reset-event).

## Pré-remplissage du formulaire

Le formulaire Sparnatural peut être pré-rempli lors du chargement de la page, de deux manières indépendantes.

**Depuis l'URL de la page.** `<sparnatural-form>` le fait de lui-même, aucun élément supplémentaire n'est nécessaire : un lien tel que `?Title=Carmen&Saison=2020` ouvre le formulaire avec ces champs remplis (y compris les champs contenant plusieurs valeurs) et soumet la recherche automatiquement. Voir [Pré-remplissage avec des paramètres d'URL ou une requête JSON](form-prefill.md) pour la syntaxe de chaque paramètre.

**Depuis une liste déroulante de requêtes prédéfinies.** Celle-ci est fournie par le composant web `<sparnatural-form-queries>`, lié à un formulaire via son attribut `for` :

```html
<sparnatural-form-queries
  src="predefined-queries.json"
  lang="en"
  for="my-form"
></sparnatural-form-queries>

<sparnatural-form id="my-form" ...></sparnatural-form>
```

Ajoutez-le uniquement lorsque vous avez un fichier de requêtes à proposer. Voir la page [Liste déroulante de requêtes prédéfinies](form-predefined-queries.md) pour la référence complète.

## API de l'élément Sparnatural Form

À venir (TODO)
