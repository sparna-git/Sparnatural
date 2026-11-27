_[Home](index.html) > Querying a password-protected SPARQL endpoint_

# Querying a password-protected SPARQL endpoint

## Shared transport with LDForge

Set authentication headers through `sparnatural.customization`. The default
[LDForge integration](LDForge-integration.md) calls `sparnatural.executeSparql()`,
so the same configuration applies to widget suggestions and the final query.
There is no second Yasqe request configuration to maintain.

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

Load the browser bundles and styles first. Attach the `init` listener before the
configuration finishes loading. If the component is already initialized, apply
the customization immediately. Supply credentials from your host application;
the integration does not persist them. A public browser application cannot keep
a hardcoded token secret. Configure the endpoint's CORS policy for the application's
origin and the headers it sends; see [SPARQL proxy](SPARQL-proxy.md).

## Explicit HTTP executor

An explicit LDForge HTTP executor bypasses Sparnatural's catalog and custom
handler. In that case configure its headers too:

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

Apply the customization after initialization. A changed token must also be
provided to the explicit executor; updating Sparnatural's headers alone does not
update that independently configured executor. See the
[legacy JavaScript reference](archives/Javascript-integration-yasgui.md) when
maintaining an existing Yasgui application.
