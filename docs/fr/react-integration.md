_[Accueil](index.html) > Intégration React_

# Utiliser Sparnatural et LDForge dans React

Sparnatural est un composant web. Montez l'intégration LDForge après la création
des références DOM React, puis appelez `destroy()` dans le nettoyage de l'effet.
L'éditeur peut être placé à côté du constructeur, avec les résultats en pleine
largeur dessous.

## Installation

Suivez le [guide LDForge](LDForge-integration.md) pour les dépendances optionnelles.
Cette documentation décrit l'intégration de cette branche, qui doit être publiée
avant de pouvoir être installée depuis le registre. La disposition séparée
requiert également [l'extension locale LDForge](../LDForge-integration.md#testing-the-unpublished-ldforge-extension)
tant qu'une version compatible n'est pas publiée.

Servez la configuration à `/config.ttl`. Copiez les fichiers `dist/browser` du
package dans `public/vendor/sparnatural`, puis chargez
`/vendor/sparnatural/sparnatural.css` dans la page HTML. Ajoutez le thème et les
icônes comme dans l'exemple navigateur. Le composant importe la feuille de style
de l'intégration ; l'ancien chemin `sparnatural/dist/sparnatural.css` n'est pas
un export public du package.

## Composant

`createElement()` rend la balise personnalisée sans déclaration de type JSX
supplémentaire. Les autres balises JSX sont des éléments DOM React ordinaires.

```tsx
import { createElement, useEffect, useRef } from "react";
import "sparnatural";
import type { SparnaturalElement } from "sparnatural";
import { createSparnaturalLDForge } from "sparnatural/ldforge";
import "sparnatural/ldforge/styles.css";

export default function App() {
  const builder = useRef<SparnaturalElement | null>(null);
  const queryHost = useRef<HTMLDivElement | null>(null);
  const resultsHost = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!builder.current || !queryHost.current || !resultsHost.current) return;
    const integration = createSparnaturalLDForge(
      builder.current,
      queryHost.current,
      { resultsContainer: resultsHost.current },
    );
    return () => integration.destroy();
  }, []);

  return (
    <main>
      <div className="query-layout">
        {createElement("spar-natural", {
          ref: builder,
          src: "/config.ttl",
          endpoint: "https://dbpedia.org/sparql",
          lang: "en",
          defaultLang: "en",
          distinct: "true",
          limit: "100",
        })}
        <div ref={queryHost} />
      </div>
      <div ref={resultsHost} />
    </main>
  );
}
```

Exemple de disposition responsive :

```css
.query-layout { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 1rem; }
@media (max-width: 800px) { .query-layout { grid-template-columns: 1fr; } }
```

L'intégration gère déjà `queryUpdated`, `submit` et la réinitialisation. Ajoutez
uniquement les observateurs propres à votre application et retirez-les dans le
nettoyage de l'effet. Sans éditeur, observez `queryUpdated` et appelez
`expandSparql()` avant d'utiliser le texte.

Le nettoyage convient aussi au cycle supplémentaire du mode strict en développement.
Voir les références officielles [useEffect](https://react.dev/reference/react/useEffect)
et [createElement](https://react.dev/reference/react/createElement).
Gardez les paramètres stables ou recréez volontairement l'intégration quand leur
configuration change. Voir la [référence JavaScript](Javascript-integration.md).

Ce composant nécessite un navigateur. En rendu côté serveur, utilisez le mécanisme
client uniquement de votre framework pour charger Sparnatural et ce composant.
