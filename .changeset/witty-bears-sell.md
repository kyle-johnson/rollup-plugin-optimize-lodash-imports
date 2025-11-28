---
"@optimize-lodash/esbuild-plugin": major
---

Replace acorn with oxc-parser. This is a significant speed increase (if you're using esbuild, that's what you want, no?) and doesn't require special typescript handling.

No longer distributing cjs, just esm.
