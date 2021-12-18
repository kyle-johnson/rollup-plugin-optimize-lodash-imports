---
"@optimize-lodash/esbuild-plugin": major
"@optimize-lodash/rollup-plugin": major
"@optimize-lodash/transform": major
---

By default, CommonJS exports now have a ".js" suffix

This can be disabled by setting the `appendDotJs` option to false. The default of `true` shouldn't break anything, but this is considered a major version bump since it's possible the output may break some builds.

Thanks to @marbemac who contributed the basic fix on #115.
