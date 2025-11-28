# @optimize-lodash/esbuild-plugin

## 4.0.0

### Major Changes

- [#499](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/499) [`1a0e21f`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/1a0e21fa74293afd4780e2f0ce5cb1e2be80107e) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Rewrite ["modularized" lodash packages](https://www.npmjs.com/search?q=keywords%3Alodash-modularized) such as `lodash.isnil` / `lodash.camelcase` / `lodash.clonedeep` to use the standard `lodash` / `lodash-es` packages. This enables tree-shaking of modularized imports for significant size savings.

  This feature can be disabled by setting `optimizeModularizedImports` to `false` (it is on by default).

- [#497](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/497) [`0464016`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/04640166c88d765cc8eac591d177acaf37ea0322) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Replace acorn with oxc-parser. This is a significant speed increase (if you're using esbuild, that's what you want, no?) and doesn't require special typescript handling.

  No longer distributing cjs, just esm.

  Package requirement is node 20+. It may work with older versions, but I don't have time/interest in validating that.

### Patch Changes

- Updated dependencies [[`1a0e21f`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/1a0e21fa74293afd4780e2f0ce5cb1e2be80107e)]:
  - @optimize-lodash/transform@4.0.0

## 3.2.0

### Minor Changes

- [#461](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/461) [`f8ad561`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/f8ad561cd1cc0dfacb2a773c7075445db7bc6fbd) Thanks [@renovate](https://github.com/apps/renovate)! - feat(deps): update dependency acorn to ~8.14.0

### Patch Changes

- [`723e375`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/723e375c8b6fc32b865d069bc1d4639249de8681) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Add build provenance.

- Updated dependencies [[`723e375`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/723e375c8b6fc32b865d069bc1d4639249de8681)]:
  - @optimize-lodash/transform@3.0.6

## 3.1.0

### Minor Changes

- [#455](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/455) [`dbccec0`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/dbccec0631340c05f28a78afe7b353916f47fd89) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Print warnings to console.error()

### Patch Changes

- [#455](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/455) [`dbccec0`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/dbccec0631340c05f28a78afe7b353916f47fd89) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - `chain()` is no longer tranformed because it cannot be imported except from the base import; a warning is printed when a matching import is found and the import is left as-is

- Updated dependencies [[`dbccec0`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/dbccec0631340c05f28a78afe7b353916f47fd89)]:
  - @optimize-lodash/transform@3.0.5

## 3.0.0

### Major Changes

- [#431](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/431) [`afa4382`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/afa438276f164a2afefbce9993f214e9a4aec8f7) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Add experimental Typescript support. Thanks @ldu1020 (#428)!

- [#430](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/430) [`85adaf4`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/85adaf4706134e15f06855f96b40311f54225d4b) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Minimum supported NodeJS version is 16 (was 12).

### Patch Changes

- Updated dependencies [[`afa4382`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/afa438276f164a2afefbce9993f214e9a4aec8f7), [`af5f97d`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/af5f97dbba80dec2cbefeee1890504aeac1cb569)]:
  - @optimize-lodash/transform@3.0.4

## 2.0.3

### Patch Changes

- [#405](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/405) [`cd01862`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/cd01862f3a3cffb05a3d7ea49587bb8f29ef723c) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Bump Typescript from 4.9.5 to 5.2.2. This should be backwards compatible, but outputs may differ slightly across Typescript versions.

- Updated dependencies [[`cd01862`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/cd01862f3a3cffb05a3d7ea49587bb8f29ef723c)]:
  - @optimize-lodash/transform@3.0.3

## 2.0.2

### Patch Changes

- Updated dependencies [[`9dfcbfb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/9dfcbfb6fd642a350520bf6bd9032918a2df6dc6)]:
  - @optimize-lodash/transform@3.0.2

## 2.0.1

### Patch Changes

- [#378](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/378) [`2ee39fb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/2ee39fb73fe818a9cf1648cdc59beba0d899b011) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - fix: update Readme shields (no code changes)

- Updated dependencies [[`2ee39fb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/2ee39fb73fe818a9cf1648cdc59beba0d899b011)]:
  - @optimize-lodash/transform@3.0.1

## 2.0.0

### Major Changes

- 7f3efc5: By default, CommonJS exports now have a ".js" suffix

  This can be disabled by setting the `appendDotJs` option to false. The default of `true` shouldn't break anything, but this is considered a major version bump since it's possible the output may break some builds.

  Thanks to @marbemac who contributed the basic fix on #115.

### Patch Changes

- Updated dependencies [7f3efc5]
  - @optimize-lodash/transform@3.0.0
