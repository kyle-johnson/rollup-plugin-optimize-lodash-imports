---
"@optimize-lodash/rollup-plugin": major
---

Support importing as ESM. CJS is still supported and this _should_ be backwards compatible, however this is being treated as a breaking change due to dropping 'main' in package.json ('exports' replaces it).
