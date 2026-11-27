# Unreleased LDForge integration

This change proposes an optional LDForge integration for Sparnatural. It has not
been published. Package versions are assigned by the maintainer's release workflow.

- Add the `sparnatural/ldforge` ESM entry and `sparnatural-ldforge.js` browser bundle.
- Use LDForge in development, Hello Sparnatural and starter examples.
- Preserve labelled URI tables and entity grouping/nested relationships in Grid.
- Add view-local geometry and COUNT chart adapters, native Cards, RDF Table and JSON.
- Share execution/loading cleanup between the visual builder and editor, including
  cancellation, reset and teardown.
- Include integration assets and lazy chunks in downloadable example archives.
- Make current English/French integration guides and the Hello Sparnatural tutorial
  use LDForge, with historical Yasgui references kept separately.
- Update React lifecycle, authentication and multi-endpoint examples; document the
  published LDForge editor requirement (`^1.5.1`).

Existing Yasgui bindings remain available. Applications adopting LDForge should
replace the Yasgui scripts/styles and result containers, then mount the new
integration as described in [LDForge integration](../LDForge-integration.md).
That guide lists plugin differences, optional dependency versions, transport and
localization limits, and configuration for self-hosted visualization libraries.

The LDForge adapter also supports a separate `resultsContainer`. Development pages restore full-width results below both columns; Hello Sparnatural and starter examples keep results visible when the query is hidden. Grid entity grouping and nested relations remain intact. The separate-host examples require the published `@ldforge/editor@^1.5.1`; registry dependencies are sufficient for normal builds. The local archive helper is optional for editor development.
