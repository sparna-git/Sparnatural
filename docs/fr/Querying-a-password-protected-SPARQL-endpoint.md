_[Accueil](index.html) > Interrogation d'un point d'accès SPARQL protégé par mot de passe_

# Interrogation d'un point d'accès SPARQL protégé par mot de passe

## Le problème

Certains points d'accès SPARQL peuvent être protégés par mot de passe. Cela nécessite l'envoi d'entêtes supplémentaires dans les requêtes.

## La solution : ajout d'entêtes supplémentaires à Sparnatural et YasQE

Vous devez ajouter des entêtes supplémentaires à deux endroits : dans Sparnatural et dans YasQE (si vous utilisez YasQE), qui enverront la requête finale au triplestore.

### Ajouter des entêtes supplémentaires à Sparnatural

Ajoutez le code suivant à votre code d'initialisation de Sparnatural pour transmettre des entêtes supplémentaires à Sparnatural :

```javascript
sparnatural.addEventListener("init", (event) => {
  sparnatural.headers = {
    "User-Agent" : "This is Sparnatural calling",
    "Authorization" : "Bearer token"
    // add other headers as necessary
  };
});
```

Sparnatural prendra en compte ces entêtes lors de l'envoi des requêtes pour peupler les listes déroulantes, les champs d'autocomplétion ou les widgets d'arborescence.

### Faire en sorte que YasQE interroge un point d'accès SPARQL protégé par mot de passe

Pour les pages de démonstration utilisant l'ancienne version de YASGUI, la documentation archivée correspondante se trouve à l'adresse https://web.archive.org/web/20190216123103/http://yasqe.yasgui.org/doc, et la fonction JQuery correcte est à l'adresse https://stackoverflow.com/a/5507289/189723

```javascript
var yasqe = YASQE.fromTextArea(document.getElementById("yasqe"), {
        sparql : {
          showQueryButton : true,
          endpoint : $('#endpoint').text(),
          beforeSend: function(xhr) { xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password)); };
        }
      });
```
