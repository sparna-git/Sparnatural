_[Accueil](index.html) > Point d'accès SPARQL protégé_

# Interroger un point d'accès SPARQL protégé

## Transport partagé avec LDForge

Configurez les en-têtes d'authentification dans `sparnatural.customization`.
L'[intégration LDForge](LDForge-integration.md) utilise par défaut
`sparnatural.executeSparql()` : la configuration s'applique aux suggestions des
widgets et à la requête finale. Il n'y a pas de deuxième configuration Yasqe.

```javascript
const sparnatural = document.querySelector("spar-natural");
sparnatural.addEventListener("init", () => {
  sparnatural.customization = {
    ...sparnatural.customization,
    headers: {
      ...sparnatural.customization.headers,
      Authorization: "Bearer REPLACE_WITH_YOUR_TOKEN",
    },
  };
});
const integration = SparnaturalLDForge.createSparnaturalLDForge(
  sparnatural,
  document.getElementById("ldforge"),
);
```

Chargez d'abord les bundles et les styles. Le gestionnaire `init` doit être ajouté
avant la fin du chargement de la configuration. Si le composant est déjà prêt,
appliquez directement la personnalisation. Les identifiants proviennent de votre
application ; l'intégration ne les conserve pas. Un jeton écrit dans le code d'une
page publique n'est pas secret. Le serveur doit autoriser l'origine et les
en-têtes utilisés dans sa politique CORS. Voir [proxy SPARQL](SPARQL-proxy.md).

## Transport HTTP explicite

Un exécuteur HTTP LDForge explicite contourne le catalogue et le gestionnaire
personnalisé de Sparnatural. Configurez alors ses en-têtes séparément :

```javascript
import { createHttpExecutor } from "@ldforge/core";
import { createSparnaturalLDForge } from "sparnatural/ldforge";

const headers = { Authorization: "Bearer REPLACE_WITH_YOUR_TOKEN" };
sparnatural.customization = { ...sparnatural.customization, headers };
const integration = createSparnaturalLDForge(sparnatural, container, {
  executor: createHttpExecutor({
    endpoint: sparnatural.getAttribute("endpoint"),
    method: "POST",
    headers,
  }),
});
```

Appliquez la personnalisation après l'initialisation. Un nouveau jeton doit aussi
être transmis à l'exécuteur explicite ; modifier uniquement les en-têtes
Sparnatural ne modifie pas cet exécuteur indépendant.
