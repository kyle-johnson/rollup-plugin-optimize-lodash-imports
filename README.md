Optimize `lodash` imports with Rollup.js
========================================
![npm](https://img.shields.io/npm/v/rollup-plugin-optimize-lodash-imports)
![node-current](https://img.shields.io/node/v/rollup-plugin-optimize-lodash-imports)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/rollup-plugin-optimize-lodash-imports/peer/rollup)
![GitHub Workflow Status](https://img.shields.io/github/workflow/status/kyle-johnson/rollup-plugin-optimize-lodash-imports/CI)
![NPM](https://img.shields.io/npm/l/rollup-plugin-optimize-lodash-imports)

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
    format: "cjs"
  },
  plugins: [
    optimizeLodashImports()        
  ]
}
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

If `true`, the plugin will rewrite *lodash* imports to use *lodash-es*.

*Note: the build will fail if your Rollup output format is not also set to `es`!*

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

To avoid this, always import the specific methods you need:

```javascript
// this import will be optimized
import { isNil } from "lodash";

export function testX(x) {
  return isNil(x);
}
```

## Why?

Mostly to support [Typescript with Rollup](https://www.npmjs.com/package/@rollup/plugin-typescript) when building reusable libraries. With `tsc` doing all the transpiling, it seemed a waste to add Babel to the mix just to use `babel-plugin-lodash`.

Other alternatives include `eslint-plugin-lodash` with the [`import-scope` rule enabled](https://github.com/wix/eslint-plugin-lodash/blob/HEAD/docs/rules/import-scope.md).

`lodah-es` support was inspired by [`tsdx`](https://github.com/formium/tsdx/blob/462af2d002987f985695b98400e0344b8f2754b7/README.md#using-lodash).
