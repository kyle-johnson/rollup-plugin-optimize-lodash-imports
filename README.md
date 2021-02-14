# Optimize `lodash` imports
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/kyle-johnson/rollup-plugin-optimize-lodash-imports/CI)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/actions)
![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/kyle-johnson/rollup-plugin-optimize-lodash-imports)

There are [multiple](https://github.com/webpack/webpack/issues/6925) [issues](https://github.com/lodash/lodash/issues/3839) [surrounding](https://github.com/rollup/rollup/issues/1403) [tree-shaking](https://github.com/rollup/rollup/issues/691) of lodash. Minifiers, even with dead-code elimination, cannot currently solve this problem.

Plugins can reduce final bundle sizes with minimal or no manual code changes. See the example showing [a 70% reduced bundle size](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/blob/main/packages/rollup-plugin/tests/bundle-size.test.ts) for [an example input](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/blob/main/packages/rollup-plugin/tests/fixtures/standard-and-fp.js).

# Packages:

### [rollup-plugin-optimize-lodash-imports](https://www.npmjs.com/package/rollup-plugin-optimize-lodash-imports)
[![npm](https://img.shields.io/npm/v/rollup-plugin-optimize-lodash-imports)](https://www.npmjs.com/package/rollup-plugin-optimize-lodash-imports)
![node-current](https://img.shields.io/node/v/rollup-plugin-optimize-lodash-imports)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/rollup-plugin-optimize-lodash-imports/peer/rollup)

A fast, lightweight plugin for Rollup bundling. Uses [@optimize-lodash/transformer](https://www.npmjs.com/package/@optimize-lodash/transformer).

### [@optimize-lodash/transformer](https://www.npmjs.com/package/@optimize-lodash/transformer)

Code transforms for lodash imports. Reusable in other packages for a shared core.
