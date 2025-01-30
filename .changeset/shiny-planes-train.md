---
"@optimize-lodash/transform": patch
"@optimize-lodash/esbuild-plugin": patch
"@optimize-lodash/rollup-plugin": patch
---

`chain()` is no longer tranformed because it cannot be imported except from the base import; a warning is printed when a matching import is found and the import is left as-is
