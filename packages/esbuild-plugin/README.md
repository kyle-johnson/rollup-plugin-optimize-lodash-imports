# Optimize `lodash` imports with esbuild

[![npm](https://img.shields.io/npm/v/@optimize-lodash/esbuild-plugin)](https://www.npmjs.com/package/@optimize-lodash/esbuild-plugin)
![node-current](https://img.shields.io/node/v/@optimize-lodash/esbuild-plugin)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/@optimize-lodash/esbuild-plugin/peer/esbuild)
[![GitHub Workflow Status](https://img.shields.io/github/actions/workflow/status/kyle-johnson/rollup-plugin-optimize-lodash-imports/main.yml?branch=main)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/actions)
[![license](https://img.shields.io/npm/l/@optimize-lodash/esbuild-plugin)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/blob/main/packages/esbuild-plugin/LICENSE)
[![Codecov](https://img.shields.io/codecov/c/github/kyle-johnson/rollup-plugin-optimize-lodash-imports?flag=esbuild-plugin&label=coverage)](https://app.codecov.io/gh/kyle-johnson/rollup-plugin-optimize-lodash-imports/)
![GitHub last commit](https://img.shields.io/github/last-commit/kyle-johnson/rollup-plugin-optimize-lodash-imports)

_**This is a proof of concept! esbuild loader plugins are "greedy" and need additional code to enable chaining. If you want something that's proven in production, consider using [@optimize-lodash/rollup-plugin](https://www.npmjs.com/package/@optimize-lodash/rollup-plugin).**_

There are [multiple](https://github.com/webpack/webpack/issues/6925) [issues](https://github.com/lodash/lodash/issues/3839) [surrounding](https://github.com/rollup/rollup/issues/1403) [tree-shaking](https://github.com/rollup/rollup/issues/691) of lodash. Minifiers, even with dead-code elimination, cannot currently solve this problem. With this plugin, bundled code output will _only_ include the specific lodash methods your code requires.

There is also an option to use [lodash-es](https://www.npmjs.com/package/lodash-es) for projects which ship ESM: transform all your `lodash` imports to use `lodash-es` which is tree-shakable.

Versions of this plugin _before_ 3.x did not support Typescript. 3.x and later support Typescript, although Typescript support is considered experimental.

### This input

```javascript
import { isNil, isString } from "lodash";
import { padStart as padStartFp } from "lodash/fp";
import kebabCase from "lodash.kebabcase";
```

### Becomes this output

```javascript
import isNil from "lodash/isNil.js";
import isString from "lodash/isString.js";
import padStartFp from "lodash/fp/padStart.js";
import kebabCase from "lodash/kebabCase.js";
```

## `useLodashEs` for ES Module Output

While `lodash-es` is not usable in CommonJS modules, some projects only need ESM output or build both CommonJS and ESM outputs.

In these cases, you can optimize by transforming `lodash` imports to `lodash-es` imports:

### Your source input

```javascript
import { isNil } from "lodash";
import kebabCase from "lodash.kebabcase";
```

#### CommonJS output

```javascript
import isNil from "lodash/isNil.js";
import kebabCase from "lodash/kebabCase.js";
```

#### ES output (with `useLodashEs: true`)

```javascript
import { isNil } from "lodash-es";
import { kebabCase } from "lodash-es";
```

## Individual `lodash.*` Method Packages

Imports from individual lodash method packages like `lodash.isnil` or `lodash.flattendeep` are transformed to use the optimized import path of `lodash` or `lodash-es`, consolidating your lodash usage to a single, tree-shakable ESM package.

### Your source input

```javascript
import isNil from "lodash.isnil";
import flattenDeep from "lodash.flattendeep";
```

#### CommonJS output

```javascript
import isNil from "lodash/isNil.js";
import flattenDeep from "lodash/flattenDeep.js";
```

#### ES output (with `useLodashEs: true`)

```javascript
import { isNil } from "lodash-es";
import { flattenDeep } from "lodash-es";
```

Aliased local names are supported (`import checkNull from "lodash.isnil"` becomes `import checkNull from "lodash/isNil.js"`).

## Usage

_Please see the [esbuild docs for the most up to date info on using plugins](https://esbuild.github.io/plugins/#using-plugins)._

```javascript
const { lodashOptimizeImports } = require("@optimize-lodash/esbuild-plugin");

require("esbuild").buildSync({
  entryPoints: ["app.js"],
  outfile: "out.js",
  plugins: [lodashOptimizeImports()],
});
```

## Options

### `useLodashEs`

Type: `boolean`<br>
Default: `false`

If `true`, the plugin will rewrite _lodash_ imports to use _lodash-es_.

**\*NOTE:** be sure esbuild's `format: "esm"` option is set!\*

### `appendDotJs`

Type: `boolean`<br>
Default: `true`

If `true`, the plugin will append `.js` to the end of CommonJS lodash imports.

Set to `false` if you don't want the `.js` suffix added (prior to v2.x, this was the default).

### `optimizeModularizedImports`

Type: `boolean`<br>
Default: `true`

When `true`, imports from individual lodash method packages (e.g., `lodash.isnil`, `lodash.kebabcase`) are transformed to optimized imports from `lodash` or `lodash-es`.

Set to `false` if you need to disable this behavior (prior to 6.x, this transformation did not ooccur).

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

The above code will not be optimized, and the plugin prints a warning.

To avoid this, always import the specific method(s) you need:

```javascript
// this import will be optimized
import { isNil } from "lodash";

export function testX(x) {
  return isNil(x);
}
```

### `chain()` cannot be optimized

The `chain()` method from `lodash` cannot be successfully imported from `"lodash/chain"` without also importing from `"lodash"`. Imports which include `chain()` are _not modified_ and the plugin prints a warning.

## Alternatives

There aren't a lot of esbuild plugins today.

If you wish to shift the responsibility off to developers, `eslint-plugin-lodash` with the [`import-scope` rule enabled](https://github.com/wix/eslint-plugin-lodash/blob/HEAD/docs/rules/import-scope.md) may help.

Using Rollup? Check out [`@optimize-lodash/rollup-plugin`](https://www.npmjs.com/package/@optimize-lodash/rollup-plugin).

Using Babel? Check out [`babel-plugin-lodash`](https://github.com/lodash/babel-plugin-lodash) (it fixes default imports too!).
