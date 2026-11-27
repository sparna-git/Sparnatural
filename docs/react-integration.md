_[Home](index.html) > React integration_

# Use Sparnatural with LDForge in React

Sparnatural is a web component. Mount the optional LDForge integration after React
has attached the builder and both container refs, then destroy it in the effect
cleanup. The query editor can sit beside the builder while results span the full
width below them.

## Setup

Use the [LDForge installation guide](LDForge-integration.md#bundler-integration)
for the Sparnatural package and its optional peers. These docs describe this
branch's integration; it must be published before the examples can be installed
from the registry. The separate-results layout also needs the
[local LDForge extension](LDForge-integration.md#testing-the-unpublished-ldforge-extension)
until a supporting editor release exists.

Serve your configuration as `/config.ttl`. Copy the package's `dist/browser`
assets into your application's `public/vendor/sparnatural` directory and load
`/vendor/sparnatural/sparnatural.css` in the HTML shell. Load a Sparnatural theme
and Font Awesome assets as in the browser example. The integration's stylesheet
is imported in the component below. The former
`sparnatural/dist/sparnatural.css` import is not a public package export.

## Component

`createElement()` renders the custom tag without requiring a custom JSX type
declaration. The surrounding JSX uses ordinary React DOM elements.

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

An optional layout stylesheet is:

```css
.query-layout { display: grid; grid-template-columns: minmax(0, 7fr) minmax(0, 5fr); gap: 1rem; }
@media (max-width: 800px) { .query-layout { grid-template-columns: 1fr; } }
```

The integration already listens for query updates, submit and reset. Add event
listeners only for application-specific work; remove those listeners in the same
effect cleanup. For an editor-independent builder, omit the integration and
listen to `queryUpdated`, then call `expandSparql()` before using the text.

React runs effect cleanup on unmount and before a changed effect runs again; its
development Strict Mode also exercises setup/cleanup. See the official
[useEffect reference](https://react.dev/reference/react/useEffect) and
[createElement reference](https://react.dev/reference/react/createElement).
Keep configuration props stable, or deliberately recreate the integration when
its host configuration changes. Sparnatural's own resizing and reconfiguration
behavior still applies; use the [JavaScript reference](Javascript-integration.md).

This is a browser-only component. In an application with server rendering,
load Sparnatural and this component through the framework's client-only route or
module mechanism; the static imports above require a browser environment.
