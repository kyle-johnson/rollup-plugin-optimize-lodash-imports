# @optimize-lodash/transform

## 3.0.1

### Patch Changes

- [#378](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/pull/378) [`2ee39fb`](https://github.com/kyle-johnson/rollup-plugin-optimize-lodash-imports/commit/2ee39fb73fe818a9cf1648cdc59beba0d899b011) Thanks [@kyle-johnson](https://github.com/kyle-johnson)! - fix: update Readme shields (no code changes)

## 3.0.0

### Major Changes

- 7f3efc5: By default, CommonJS exports now have a ".js" suffix

  This can be disabled by setting the `appendDotJs` option to false. The default of `true` shouldn't break anything, but this is considered a major version bump since it's possible the output may break some builds.

  Thanks to @marbemac who contributed the basic fix on #115.
