_[Accueil](index.html) > Historique Sparnatural_

Cette page a été traduite automatiquement à partir de la [page d'origine en anglais](../sparnatural-history.md) - le 19/11/2026


# Intégration Javascript de l'historique Sparnatural

## Constructeur

L'historique Sparnatural s'insère sous la forme d'un élément HTML personnalisé nommé `<sparnatural-history>` :

```html
<sparnatural-history lang="en"></sparnatural-history>
```

Cet élément représente la boîte de dialogue modale qui gère l'historique. Elle est invisible par défaut. Vous devez ouvrir la boîte de dialogue modale à partir d'un bouton ou d'un lien dans la page principale.

Vous pouvez utiliser n'importe quel élément HTML (un `<button>`, `<div>`, `<icon>`, etc.) pour déclencher manuellement la modale d'historique :

```html
<!-- Bouton de déclenchement personnalisé -->
<button id="myCustomButton" class="history-btn">
  Historique <i class="fas fa-history"></i>
</button>

<!-- Boîte de dialogue modale d'historique -->
<sparnatural-history lang="en"></sparnatural-history>
```

Pour ouvrir la modale d'historique, appelez la fonction `.openHistoryModal()` sur l'élément `sparnatural-history` :

```javascript
const historyComponent = document.querySelector("sparnatural-history");

document.getElementById("myCustomButton").addEventListener("click", () => {
  historyComponent.openHistoryModal();
});
```

Cela vous donne une flexibilité totale pour placer le déclencheur de l'historique où vous le souhaitez et comme vous le souhaitez dans votre interface utilisateur.

## Référence des attributs HTML

| Attribut | Description                                                | Valeur par défaut | Obligatoire/Optionnel |
| --------- | ---------------------------------------------------------- | ------------------ | --------------------- |
| `lang`    | Langue à utiliser pour les libellés et traductions (`en` ou `fr`) | `en`    | Optionnel           |

## Événements de l'historique Sparnatural

Sparnatural History envoie les événements suivants :

### `init`

Déclenché lorsque le composant a terminé son initialisation.

### `loadQuery`

Déclenché lorsque l'utilisateur clique sur le bouton "charger la requête" dans la boîte de dialogue modale d'historique. C'est l'événement à écouter pour charger la requête dans Sparnatural. La requête est accessible dans l'attribut `event.detail.query`.

```javascript
const sparnatural = document.querySelector("sparnatural");
const sparnaturalHistory = document.querySelector("sparnatural-history");
sparnaturalHistory.addEventListener("loadQuery", (event) => {
  const query = event.detail.query;
  sparnatural.loadQuery(query);
});
```

## Méthodes de l'API

| Méthode             | Description                                                                 | Paramètres                   |
| ------------------ | --------------------------------------------------------------------------- | ---------------------------- |
| `openHistoryModal()` | Ouvre la boîte de dialogue modale d'historique | aucun                         |
| `saveQuery(query)`   | Sauvegarde une requête dans l'historique | queryJson (objet ISparJson) |
| `notifyConfiguration(config)`   | Notifie la configuration Sparnatural au composant d'historique | Configuration Sparnatural |

## Intégration manuelle typique

Typiquement, l'intégration implique :
  1. (optionnel) Transmettre la configuration de Sparnatural à l'élément sparnatural-history
  2. sauvegarder la requête JSON de Sparnatural dans l'historique chaque fois que la requête est soumise depuis Sparnatural
  3. charger la requête dans Sparnatural chaque fois que l'utilisateur la charge depuis l'historique

```javascript
const sparnatural = document.querySelector("sparnatural");
const sparnaturalHistory = document.querySelector("sparnatural-history");

sparnatural.addEventListener("init", () => {
  // ... autres actions ici ...
  // notifier le composant d'historique de la configuration
  sparnaturalHistory.notifyConfiguration(event.detail.config);
});

sparnatural.addEventListener("queryUpdated", (event) => {
  // ... autres actions ici ...
  // Chaque fois que la requête change, la sauvegarder dans un champ caché
  document.getElementById("query-json").value = JSON.stringify(
    event.detail.queryJson
  );
});

sparnatural.addEventListener("submit", () => {
  // ... autres actions ici ...
  // Chaque fois que la requête est soumise, l'envoyer au composant d'historique
  // utiliser la méthode saveQuery du composant d'historique
  sparnaturalHistory.saveQuery(document.getElementById("query-json").value);
});

// Chaque fois qu'une requête est chargée depuis l'historique, la charger dans Sparnatural
sparnaturalHistory.addEventListener("loadQuery", (event) => {
  const query = event.detail.query;
  sparnatural.loadQuery(query);
});
```

## Intégration typique via sparnatural-bindings.js

L'intégration manuelle décrite ci-dessus peut être directement

```javascript
const sparnatural = document.querySelector("sparnatural");
const sparnaturalHistory = document.querySelector("sparnatural-history");
bindSparnaturalWithHistory(sparnatural, sparnaturalHistory);
```
