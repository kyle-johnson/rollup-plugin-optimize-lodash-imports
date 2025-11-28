# @optimize-lodash/rollup-plugin

## 6.0.0

### Major Changes

- [#499](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/499) [`1a0e21f`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/1a0e21fa74293afd4780e2f0ce5cb1e2be80107e) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Rewrite ["modularized" lodash packages](https://www.npmjs.com/search?q=keywords%3Alodash-modularized) such as `lodash.isnil` / `lodash.camelcase` / `lodash.clonedeep` to use the standard `lodash` / `lodash-es` packages. This enables tree-shaking of modularized imports for significant size savings.

  This feature can be disabled by setting `optimizeModularizedImports` to `false` (it is on by default).

### Patch Changes

- Updated dependencies [[`1a0e21f`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/1a0e21fa74293afd4780e2f0ce5cb1e2be80107e)]:
  - @optimize-lodash/transform@4.0.0

## 5.1.0

### Minor Changes

- [#487](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/487) [`f61e91a`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/f61e91a0e84b6df39f0764dd0bd06e1a03fb43d3) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Support Rollup's JSX mode and improve Rolldown support with a new option: `parseOptions`.

  This allows setting `jsx: true` for rollup's new JSX mode or to specify the `lang` setting in Rolldown.

  Added a test suite for Rolldown which includes a TypeScript example.

## 5.0.2

### Patch Changes

- [`723e375`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/723e375c8b6fc32b865d069bc1d4639249de8681) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Add build provenance.

- Updated dependencies [[`723e375`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/723e375c8b6fc32b865d069bc1d4639249de8681)]:
  - @optimize-lodash/transform@3.0.6

## 5.0.1

### Patch Changes

- [#455](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/455) [`dbccec0`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/dbccec0631340c05f28a78afe7b353916f47fd89) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - `chain()` is no longer tranformed because it cannot be imported except from the base import; a warning is printed when a matching import is found and the import is left as-is

- Updated dependencies [[`dbccec0`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/dbccec0631340c05f28a78afe7b353916f47fd89)]:
  - @optimize-lodash/transform@3.0.5

## 5.0.0

### Major Changes

- [#435](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/435) [`af5f97d`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/af5f97dbba80dec2cbefeee1890504aeac1cb569) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - NodeJS 18+ required. Rollup 4.x+ required. Previous versions probably worked with Rollup 4.x, but this makes it official and frees us from assumptions of past versions.

### Patch Changes

- Updated dependencies [[`afa4382`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/afa438276f164a2afefbce9993f214e9a4aec8f7), [`af5f97d`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/af5f97dbba80dec2cbefeee1890504aeac1cb569)]:
  - @optimize-lodash/transform@3.0.4

## 4.0.4

### Patch Changes

- [#400](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/400) [`d56ff02`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/d56ff024eb73c6ea1cac4846cbce0d9db6ec3ba6) Thanks [@IlyaSemenov](https://github.com/IlyaSemenov)! - Support TypeScript `"moduleResolution": "node16"`.

- [#405](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/405) [`cd01862`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/cd01862f3a3cffb05a3d7ea49587bb8f29ef723c) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - Bump Typescript from 4.9.5 to 5.2.2. This should be backwards compatible, but outputs may differ slightly across Typescript versions.

- Updated dependencies [[`cd01862`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/cd01862f3a3cffb05a3d7ea49587bb8f29ef723c)]:
  - @optimize-lodash/transform@3.0.3

## 4.0.3

### Patch Changes

- Updated dependencies [[`9dfcbfb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/9dfcbfb6fd642a350520bf6bd9032918a2df6dc6)]:
  - @optimize-lodash/transform@3.0.2

## 4.0.2

### Patch Changes

- [#378](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/378) [`2ee39fb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/2ee39fb73fe818a9cf1648cdc59beba0d899b011) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - fix: update Readme shields (no code changes)

- Updated dependencies [[`2ee39fb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/2ee39fb73fe818a9cf1648cdc59beba0d899b011)]:
  - @optimize-lodash/transform@3.0.1

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
