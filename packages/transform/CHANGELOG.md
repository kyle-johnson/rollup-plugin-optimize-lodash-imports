# @optimize-lodash/transform

## 3.0.6

### Patch Changes

- [`723e375`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/723e375c8b6fc32b865d069bc1d4639249de8681) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Add build provenance.

## 3.0.5

### Patch Changes

- [#455](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/455) [`dbccec0`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/dbccec0631340c05f28a78afe7b353916f47fd89) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - `chain()` is no longer tranformed because it cannot be imported except from the base import; a warning is printed when a matching import is found and the import is left as-is

## 3.0.4

### Patch Changes

- [#431](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/431) [`afa4382`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/afa438276f164a2afefbce9993f214e9a4aec8f7) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Bump acorn dev dependency, required for esbuild plugin changes.

- [#435](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/435) [`af5f97d`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/af5f97dbba80dec2cbefeee1890504aeac1cb569) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Be slightly more specific about dependency versions to avoid potential deep type-check issues.

## 3.0.3

### Patch Changes

- [#405](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/405) [`cd01862`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/cd01862f3a3cffb05a3d7ea49587bb8f29ef723c) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Bump Typescript from 4.9.5 to 5.2.2. This should be backwards compatible, but outputs may differ slightly across Typescript versions.

## 3.0.2

### Patch Changes

- [#371](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/371) [`9dfcbfb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/9dfcbfb6fd642a350520bf6bd9032918a2df6dc6) Thanks [@renovate](https://github.com/apps/renovate)! - Update dependency magic-string to 0.27.x. This is a small performance increase.

## 3.0.1

### Patch Changes

- [#378](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/378) [`2ee39fb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/2ee39fb73fe818a9cf1648cdc59beba0d899b011) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - fix: update Readme shields (no code changes)

## 3.0.0

### Major Changes

- 7f3efc5: By default, CommonJS exports now have a ".js" suffix

  This can be disabled by setting the `appendDotJs` option to false. The default of `true` shouldn't break anything, but this is considered a major version bump since it's possible the output may break some builds.

  Thanks to @marbemac who contributed the basic fix on #115.
