# @optimize-lodash/rollup-plugin

## 4.0.1

### Patch Changes

- [#360](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/360) [`aacef60`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/aacef604e9e5639a447a64274548dd3fb87156c1) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Document Vite compatibility/use. Add `vite-plugin` to package.json keywords.

## 4.0.0

### Major Changes

- [#357](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/357) [`bc61cb0`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/bc61cb017971f715d369f70c05397ac01b354ca8) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Support importing as ESM. CJS is still supported and this _should_ be backwards compatible, however this is being treated as a breaking change due to dropping 'main' in package.json ('exports' replaces it). The actual value of this is fairly low since ESM can import CommonJS.

## 3.2.0

### Minor Changes

- [#352](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/352) [`4d1525e`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/4d1525e4819502bed3f461e91cc3937c2f9b114a) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Support Rollup 3.x. This plugin remains backwards compatible with Rollup 2.x.

## 3.1.0

### Minor Changes

- [#319](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/319) [`80feb5f`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/80feb5ffdc50b9ce1a007cd90c08486ca9a9084a) Thanks [@antixrist](https://github.com/antixrist)! - Support `esm` and `module` formats. (Thanks @antixrist !)

## 3.0.0

### Major Changes

- 7f3efc5: By default, CommonJS exports now have a ".js" suffix

  This can be disabled by setting the `appendDotJs` option to false. The default of `true` shouldn't break anything, but this is considered a major version bump since it's possible the output may break some builds.

  Thanks to @marbemac who contributed the basic fix on #115.

### Patch Changes

- Updated dependencies [7f3efc5]
  - @optimize-lodash/transform@3.0.0
