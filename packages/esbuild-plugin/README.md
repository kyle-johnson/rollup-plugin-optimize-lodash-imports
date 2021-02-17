# Optimize `lodash` imports with esbuild

[![npm](https://img.shields.io/npm/v/@optimize-lodash/esbuild-plugin)](https://www.npmjs.com/package/@optimize-lodash/esbuild-plugin)
![node-current](https://img.shields.io/node/v/@optimize-lodash/esbuild-plugin)
![npm peer dependency version](https://img.shields.io/npm/dependency-version/@optimize-lodash/esbuild-plugin/peer/esbuild)
[![GitHub Workflow Status](https://img.shields.io/github/workflow/status/kyle-johnson/rollup-plugin-optimize-lodash-imports/CI)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/actions)
![LGTM Grade](https://img.shields.io/lgtm/grade/javascript/github/kyle-johnson/rollup-plugin-optimize-lodash-imports)
[![license](https://img.shields.io/npm/l/@optimize-lodash/rollup-plugin)](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/blob/main/packages/rollup-plugin/LICENSE)

_**This is a proof of concept! esbuild loader plugins are "greedy" and need additional code to enable chaining.**_

There are [multiple](https://github.com/webpack/webpack/issues/6925) [issues](https://github.com/lodash/lodash/issues/3839) [surrounding](https://github.com/rollup/rollup/issues/1403) [tree-shaking](https://github.com/rollup/rollup/issues/691) of lodash. Minifiers, even with dead-code elimination, cannot currently solve this problem. With this plugin, bundled code output will _only_ include the specific lodash methods your code requires.

There is also an option to use [lodash-es](https://www.npmjs.com/package/lodash-es) for projects which ship CommonJS and ES builds: the ES build will be transformed to import from `lodash-es`.

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

While `lodash-es` is not usable from CommonJS modules, some projects use Rollup to create two outputs: one for ES and one for CommonJS.

In this case, you can offer your users the best of both:

### Your source input

```javascript
import { isNil } from "lodash";
```

#### CommonJS output

```javascript
import isNil from "lodash/isNil";
```

#### ES output (with `useLodashEs: true`)

```javascript
import { isNil } from "lodash-es";
```

## Usage

_TODO_

## Options

_TODO_

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

## Alternatives

There aren't a lot of esbuild plugins today.

If you wish to shift the responsibility off to developers, `eslint-plugin-lodash` with the [`import-scope` rule enabled](https://github.com/wix/eslint-plugin-lodash/blob/HEAD/docs/rules/import-scope.md) may help.

Using Rollup? Check out [`@optimize-lodash/rollup-plugin`](https://www.npmjs.com/package/@optimize-lodash/rollup-plugin).

Using Babel? Check out [`babel-plugin-lodash`](https://github.com/lodash/babel-plugin-lodash) (it fixes default imports too!).
