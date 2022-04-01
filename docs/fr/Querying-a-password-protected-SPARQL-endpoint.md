_[Accueil](/fr) > Requêter un service SPARQL protégé par mot de passe_

# Requêter un service SPARQL protégé par mot de passe

Cette aspect est en fait géré par YASQE, pas par Sparnatural.

```javascript
var yasqe = YASQE.fromTextArea(document.getElementById("yasqe"), {
  sparql : {
    showQueryButton : true,
    endpoint : $('#endpoint').text(),
    beforeSend: function(xhr) { xhr.setRequestHeader("Authorization", "Basic " + btoa(username + ":" + password)); };
  }
});
```

Pour les pages de démo utilisant l'ancienne version de YASGUI, la documentation est archivée à https://web.archive.org/web/20190216123103/http://yasqe.yasgui.org/doc, et la fonction JQuery à utiliser est à https://stackoverflow.com/a/5507289/189723