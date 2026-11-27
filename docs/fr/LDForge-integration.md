_[Accueil](index.html) > Intégration LDForge_

# Éditeur et résultats LDForge

Sparnatural construit des requêtes indépendamment de leur éditeur et de leur
visualisation. Les exemples de cette branche utilisent une intégration LDForge
optionnelle ; le composant principal n'importe pas LDForge.

> La séparation de l'éditeur et des résultats utilise encore une extension locale
> non publiée de LDForge. Suivez la [préparation locale](../LDForge-integration.md#testing-the-unpublished-ldforge-extension)
> avant de construire les exemples. Une version publiée compatible doit être
> requise avant leur publication. Cette intégration Sparnatural doit elle aussi
> être publiée avant d'être installable depuis le registre.

## Bundles pour le navigateur

À partir de la branche contenant l'intégration, installez les dépendances,
appliquez si nécessaire l'archive LDForge locale, puis exécutez `npm run build`.
Les archives `hello-sparnatural.zip` et `sparnatural-starter.zip` incluent les
styles, les notices de licence et les fragments JavaScript différés. Pour une
autre page, copiez tous les fichiers de `dist/browser` en conservant leurs noms
et chemins relatifs.

```html
<link rel="stylesheet" href="sparnatural.css">
<link rel="stylesheet" href="sparnatural-ldforge.css">
<spar-natural src="config.ttl" endpoint="https://dbpedia.org/sparql"
  lang="fr" defaultLang="en" limit="100"></spar-natural>
<div id="ldforge"></div>
<div id="ldforge-results"></div>
<script src="sparnatural.js"></script>
<script src="sparnatural-ldforge.js"></script>
<script>
  const integration = SparnaturalLDForge.createSparnaturalLDForge(
    document.querySelector("spar-natural"),
    document.getElementById("ldforge"),
    { resultsContainer: document.getElementById("ldforge-results") },
  );
</script>
```

Ajoutez le thème, les icônes et les autres ressources Sparnatural comme dans les
exemples. Servez la page en HTTP ; n'ouvrez pas directement `index.html` par
`file:`. Les scripts/styles Triply et l'ancien bundle de plugins ne sont pas
nécessaires dans ces pages.

## Utilisation avec un bundler

L'entrée ESM est `sparnatural/ldforge`, avec la feuille de style
`sparnatural/ldforge/styles.css`. Installez les dépendances optionnelles uniquement
si vous utilisez cette entrée. Les versions de base et les prérequis non publiés
sont précisés dans le [guide technique anglais](../LDForge-integration.md#bundler-integration).
TypeScript doit utiliser une résolution compatible avec les exports du package.

```javascript
import "sparnatural";
import "sparnatural/ldforge/styles.css";
import { createSparnaturalLDForge } from "sparnatural/ldforge";

const integration = createSparnaturalLDForge(sparnatural, queryHost, {
  resultsContainer: resultsHost,
  queryVisible: false,
});
integration.setQueryVisible(true);
// Avant de retirer les conteneurs :
integration.destroy();
```

Chargez aussi le CSS et le thème du constructeur Sparnatural.
`destroy()` retire les écouteurs, annule le travail en cours et détruit le contenu
appartenant à l'intégration dans les deux hôtes.

## Événements et transport

L'intégration développe et synchronise le SPARQL lors de `queryUpdated`, exécute
la requête à `submit` et réinitialise l'éditeur à `reset` ou `resetEditor`.
Elle conserve la configuration reçue à `init` pour les libellés. N'ajoutez pas
un deuxième gestionnaire qui exécute la même requête.

Par défaut, le transport appelle `sparnatural.executeSparql()` et conserve le
catalogue multi-endpoints, les en-têtes et le gestionnaire personnalisé.
L'annulation empêche une réponse tardive de s'afficher, sans arrêter la requête
réseau de cette API à callbacks. Le chargement est terminé en cas de succès,
d'erreur ou d'annulation. `enablePlayBtn()` retire le chargement ; le constructeur
visuel décide quand son bouton peut être réactivé.

Pour un transport HTTP annulable ou des résultats RDF de graphe, passez un
exécuteur explicite, qui contourne le catalogue Sparnatural :

```javascript
import { createHttpExecutor } from "@ldforge/core";
const integration = createSparnaturalLDForge(sparnatural, queryHost, {
  executor: createHttpExecutor({
    endpoint: sparnatural.getAttribute("endpoint"),
    method: "GET",
  }),
});
```

L'application gère les identifiants et CORS ; l'intégration ne stocke pas de
jetons ni d'espace de travail. Voir [authentification](Querying-a-password-protected-SPARQL-endpoint.md).

## Disposition et options

`resultsContainer` place la barre de vues, l'état, le chargement, les erreurs,
la documentation, le téléchargement et le résultat dans un hôte séparé.
Sans cette option, la disposition combinée reste disponible.
`queryVisible` n'agit que sur l'éditeur, pas sur les résultats séparés.
Les deux conteneurs doivent appartenir au même document.

`editorOptions` transmet la configuration native LDForge, dont les contrôles et
les renderers. `resultOptions` configure les adaptations de résultats et les
liens. La couleur principale par défaut est `#1d78e0` et peut être changée par
`editorOptions.themeMainColor`.

Les contrôles LDForge sont en anglais par défaut, avec le néerlandais disponible
via `editorOptions.locale: "nl"`. Les messages de Labelled table et Grid restent
en anglais. Les libellés Sparnatural conservent la langue de leur configuration.

## Vues et migration

Voir les [vues de résultats](result-display.md) : tableau avec libellés, Grid
regroupé par entité, Cards générique, carte, graphiques, Table native et JSON.
Les données JSON/CSV originales ne sont pas modifiées par les adaptations.
Les anciennes options DataTables, `bindingSetAdapter`, icônes de configuration,
vues numérique/polaire de Stats et couches spéciales de Map ne sont pas reprises.

```javascript
const integration = createSparnaturalLDForge(sparnatural, container, {
  resultOptions: {
    uriHrefAdapter: (uri) =>
      uri.replace(
        "http://fr.dbpedia.org/resource/",
        "https://fr.wikipedia.org/wiki/",
      ),
  },
});
```

Seuls les liens HTTP(S) absolus deviennent cliquables dans Labelled table et
Grid ; les valeurs de texte ne sont jamais interprétées comme HTML.

## Bibliothèques externes et développement

Les bibliothèques de cartes/graphiques sont chargées à l'activation. Les modules
jsDelivr et les tuiles OpenStreetMap par défaut peuvent être remplacés via
`resultOptions.geo` et `resultOptions.charts`. Consultez les
[options et contrats complets](../LDForge-integration.md#maps-and-charts) pour
l'hébergement local, les styles et les modes optionnels.

`npm run dev` sert la page sur <http://127.0.0.1:4174/dev-page/>. Les valeurs des
widgets et les requêtes réelles nécessitent l'accès au point d'accès configuré.
`npm test -- --runInBand src/__tests__/ldforge` vérifie l'intégration.

Pour une application Yasgui existante, conservez ses dépendances et les
[anciens bindings](archives/Javascript-integration-yasgui.md). Leur API reste
disponible ; ils ne doivent pas être mélangés avec l'exécution LDForge d'une même
page.
