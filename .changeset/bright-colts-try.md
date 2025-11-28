---
"@optimize-lodash/esbuild-plugin": major
"@optimize-lodash/rollup-plugin": major
"@optimize-lodash/transform": major
---

Rewrite ["modularized" lodash packages](https://www.npmjs.com/search?q=keywords%3Alodash-modularized) such as `lodash.isnil` / `lodash.camelcase` / `lodash.clonedeep` to use the standard `lodash` / `lodash-es` packages. This enables tree-shaking of modularized imports for significant size savings.

This feature can be disabled by setting `optimizeModularizedImports` to `false` (it is on by default).
