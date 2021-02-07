# Optimize `lodash` imports with Rollup.js

[![npm](https://img.shields.io/npm/v/rollup-plugin-optimize-lodash-imports)](https://www.npmjs.com/package/rollup-plugin-optimize-lodash-imports)
![node-current](https://img.shields.io/node/v/rollup-plugin-optimize-lodash-imports)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/rollup-plugin-optimize-lodash-imports/peer/rollup)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/kyle-johnson/rollup-plugin-optimize-lodash-imports/CI)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/actions)
![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/kyle-johnson/rollup-plugin-optimize-lodash-imports)
[![license](https://img.shields.io/npm/l/rollup-plugin-optimize-lodash-imports)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/blob/main/LICENSE)

Like [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash) but runs in [rollup.js](https://rollupjs.org/) without Babel. Also includes an option to use [lodash-es](https://www.npmjs.com/package/lodash-es) for cases where you're outputting CommonJS and ES builds and want your ES builds to transparently use lodash-es.

### This input

```javascript
import { isNil, isString } from "lodash";
import { padStart as padStartFp } from "lodash/fp";
```

### Becomes this output

```javascript
import isNil from "lodash/isNil";
import isString from "lodash/isString";
import padStartFp from "lodash/fp/padStart";
```

## `useLodashEs` for ES Module Output

`lodash-es` is not usable from CommonJS modules, but sometimes you'll use Rollup for a project with two outputs: one for ES and one for CommonJS. In this case, you can offer your users the best of both worlds:

### Your source

```javascript
import { isNil } from "lodash";
```

### Your Rollup Outputs

#### CommonJS

```javascript
import isNil from "lodash/isNil";
```

#### ES (with `useLodashEs: true`)

```javascript
import { isNil } from "lodash-es";
```

## Usage

```javascript
import optimizeLodashImports from "rollup-plugin-optimize-lodash-imports";

export default {
  input: "src/index.js",
  output: {
    dir: "dist",
    format: "cjs",
  },
  plugins: [optimizeLodashImports()],
};
```

## Options

Configuration can be passed to the plugin as an object with the following keys:

### `exclude`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should _ignore_. By default no files are ignored.

### `include`

Type: `String` | `Array[...String]`<br>
Default: `null`

A [minimatch pattern](https://github.com/isaacs/minimatch), or array of patterns, which specifies the files in the build the plugin should operate on. By default all files are targeted.

### `useLodashEs`

Type: `boolean`<br>
Default: `false`

If `true`, the plugin will rewrite _lodash_ imports to use _lodash-es_.

_Note: the build will fail if your Rollup output format is not also set to `es`!_

## Limitations

### Default imports are not optimized

Unlike [babel-plugin-lodash](https://github.com/lodash/babel-plugin-lodash), there is no support for optimizing the lodash default import, such as in this case:

```javascript
// this import can't be optimized
import _ from "lodash";

export function testX(x) {
  return _.isNil(x);
}
```

The above code will not be optimized, and Rollup will print a warning.

To avoid this, always import the specific method(s) you need:

```javascript
// this import will be optimized
import { isNil } from "lodash";

export function testX(x) {
  return isNil(x);
}
```

## Why?

There are [multiple](https://github.com/webpack/webpack/issues/6925) [issues](https://github.com/lodash/lodash/issues/3839) [surrounding](https://github.com/rollup/rollup/issues/1403) [tree-shaking](https://github.com/rollup/rollup/issues/691) of lodash.

[`babel-plugin-lodash`](https://www.npmjs.com/package/babel-plugin-lodash) solves the issue, but it requires Babel. Many projects use [@rollup/plugin-typescript](https://www.npmjs.com/package/@rollup/plugin-typescript) which offloads transpiling to `tsc`. It seems a waste to add Babel to the mix just to use `babel-plugin-lodash`.

Other alternatives include `eslint-plugin-lodash` with the [`import-scope` rule enabled](https://github.com/wix/eslint-plugin-lodash/blob/HEAD/docs/rules/import-scope.md). This works, but requires your time to fix all of those imports.

The `lodash-es` support was inspired by [`tsdx`](https://github.com/formium/tsdx/blob/462af2d002987f985695b98400e0344b8f2754b7/README.md#using-lodash). It can be used to solve an issue where toolchains view `lodash-es` and `lodash` as separate packages, doubling up on the individual lodash methods shipped to browsers.
