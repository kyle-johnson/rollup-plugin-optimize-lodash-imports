# @optimize-lodash/esbuild-plugin

## 2.0.0
### Major Changes

- 7f3efc5: By default, CommonJS exports now have a ".js" suffix
  
  This can be disabled by setting the `appendDotJs` option to false. The default of `true` shouldn't break anything, but this is considered a major version bump since it's possible the output may break some builds.
  
  Thanks to @marbemac who contributed the basic fix on #115.

### Patch Changes

- Updated dependencies [7f3efc5]
  - @optimize-lodash/transform@3.0.0
