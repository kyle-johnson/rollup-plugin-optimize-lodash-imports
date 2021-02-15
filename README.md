# Optimize `lodash` imports
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/kyle-johnson/rollup-plugin-optimize-lodash-imports/CI)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/actions)
![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/kyle-johnson/rollup-plugin-optimize-lodash-imports)

There are [multiple](https://github.com/webpack/webpack/issues/6925) [issues](https://github.com/lodash/lodash/issues/3839) [surrounding](https://github.com/rollup/rollup/issues/1403) [tree-shaking](https://github.com/rollup/rollup/issues/691) of lodash. Minifiers, even with dead-code elimination, cannot currently solve this problem.

Plugins can reduce final bundle sizes with minimal or no manual code changes. See the example showing [a 70% reduced bundle size](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/blob/main/packages/rollup-plugin/tests/bundle-size.test.ts) for [an example input](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/blob/main/packages/rollup-plugin/tests/fixtures/standard-and-fp.js).

# Packages:

## [@optimize-lodash/rollup-plugin](https://www.npmjs.com/package/@optimize-lodash/rollup-plugin)
[![npm](https://img.shields.io/npm/v/@optimize-lodash/rollup-plugin)](https://www.npmjs.com/package/@optimize-lodash/rollup-plugin)
![node-current](https://img.shields.io/node/v/@optimize-lodash/rollup-plugin)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/@optimize-lodash/rollup-plugin/peer/rollup)

A fast, lightweight plugin for Rollup bundling.

## [@optimize-lodash/transform](https://www.npmjs.com/package/@optimize-lodash/transform)
[![npm](https://img.shields.io/npm/v/@optimize-lodash/transform)](https://www.npmjs.com/package/@optimize-lodash/transform)

Code transforms for lodash imports. Used by bundler plugins for a consistent, well-tested, shared set of transforms.
