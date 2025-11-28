---
"@optimize-lodash/esbuild-plugin": major
---

Replace acorn with oxc-parser. This is a significant speed increase (if you're using esbuild, that's what you want, no?) and doesn't require special typescript handling.

No longer distributing cjs, just esm.

Package requirement is node 20+. It may work with older versions, but I don't have time/interest in validating that.
