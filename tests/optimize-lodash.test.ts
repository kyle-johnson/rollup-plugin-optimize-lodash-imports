import * as acorn from "acorn";
import type { SourceDescription, TransformPluginContext } from "rollup";

import optimizeLodash, { OptimizeLodashOptions } from "../src";

const UNCHANGED = null;
type UNCHANGED = null;

describe("optimizeLodash", () => {
  const warnMock = jest.fn<ReturnType<TransformPluginContext["warn"]>, any>();
  const wrapper = (input: string, options?: OptimizeLodashOptions) =>
    optimizeLodash(options).transform.call(
      {
        parse: (code) =>
          acorn.parse(code, { sourceType: "module", ecmaVersion: 9 }),
        warn: warnMock as TransformPluginContext["warn"],
      } as TransformPluginContext,
      input,
      "irrelevant-input-identifier"
    );

  beforeEach(() => {
    warnMock.mockReset();
  });

  describe("default options", () => {
    test.each<[string, string | UNCHANGED]>([
      // expected transformations
      [`import { isNil } from 'lodash';`, `import isNil from "lodash/isNil";`],
      [
        `import { isNil as nil } from 'lodash';`,
        `import isNil as nil from "lodash/isNil";`,
      ],
      [
        `import { isNil, isString } from 'lodash';`,
        `import isNil from "lodash/isNil";\nimport isString from "lodash/isString";`,
      ],
      [
        `import { isNil } from 'lodash';\nimport { isString } from 'lodash';`,
        `import isNil from "lodash/isNil";\nimport isString from "lodash/isString";`,
      ],
      [
        `import { isNil, isString as str } from 'lodash';`,
        `import isNil from "lodash/isNil";\nimport isString as str from "lodash/isString";`,
      ],
      [
        `import { some } from 'lodash/fp';`,
        `import some from "lodash/fp/some";`,
      ],
      // nothing to transform
      [`const k = 1;`, UNCHANGED],
      [``, UNCHANGED],
      [`function hello() {}`, UNCHANGED],
      // ignore non-lodash imports
      [`import hello from "world";`, UNCHANGED],
      // ignore lodash-es imports
      [`import { isNil } from "lodash-es";`, UNCHANGED],
      // ignore full lodash imports
      [`import _ from "lodash";`, UNCHANGED],
      [`import lodash from "lodash";`, UNCHANGED],
      [`import lodash from "lodash/fp";`, UNCHANGED],
      [`import * as lodash from "lodash";`, UNCHANGED],
      [`import * as lodash from "lodash/fp";`, UNCHANGED],
      // ignore already-optimized lodash imports
      [`import isNil from 'lodash/isNil';`, UNCHANGED],
      [`import extend from 'lodash/fp/extend';`, UNCHANGED],
    ])("%s", (input, expectedOutput) => {
      const output = wrapper(input);
      if (expectedOutput) {
        expect(output).not.toBeNull();
        expect((output as SourceDescription).code).toEqual(expectedOutput);
      } else {
        expect(output).toBeNull();
      }
    });
  });

  describe("useLodashEs = true", () => {
    test.each<[string, string | UNCHANGED]>([
      // expected transformations
      [`import { isNil } from 'lodash';`, `import { isNil } from "lodash-es";`],
      [
        `import { isNil as nil } from 'lodash';`,
        `import { isNil as nil } from "lodash-es";`,
      ],
      [
        `import { isNil, isString } from 'lodash';`,
        `import { isNil } from "lodash-es";\nimport { isString } from "lodash-es";`,
      ],
      [
        `import { isNil } from 'lodash';\nimport { isString } from 'lodash';`,
        `import { isNil } from "lodash-es";\nimport { isString } from "lodash-es";`,
      ],
      [
        `import { isNil, isString as str } from 'lodash';`,
        `import { isNil } from "lodash-es";\nimport { isString as str } from "lodash-es";`,
      ],
      [
        `import { some } from 'lodash/fp';`,
        `import { some } from "lodash-es/fp";`,
      ],
      // nothing to transform
      [`const k = 1;`, UNCHANGED],
      [``, UNCHANGED],
      [`function hello() {}`, UNCHANGED],
      // ignore non-lodash imports
      [`import hello from "world";`, UNCHANGED],
      // ignore lodash-es imports
      [`import { isNil } from "lodash-es";`, UNCHANGED],
      // ignore lodash/fp imports
      [`import extend from "lodash/fp/extend";`, UNCHANGED],
      // ignore full lodash imports
      [`import lodash from "lodash";`, UNCHANGED],
      [`import * as lodash from "lodash";`, UNCHANGED],
      [`import fp from "lodash/fp";`, UNCHANGED],
      // ignore already-optimized imports
      [`import isNil from "lodash/isNil";`, UNCHANGED],
      [`import { extend } from "lodash-es/fp";`, UNCHANGED],
    ])("%s", (input, expectedOutput) => {
      const output = wrapper(input, { useLodashEs: true });
      if (expectedOutput) {
        expect(output).not.toBeNull();
        expect((output as SourceDescription).code).toEqual(expectedOutput);
      } else {
        expect(output).toBeNull();
      }
    });
  });

  describe("warn on incompatible imports", () => {
    test.each<[string, number]>([
      // unsupported cases which should warn
      [`import lodash from "lodash";`, 1],
      [`import _ from "lodash";`, 1],
      [`import fp from "lodash/fp";`, 1],
      [`import * as lodash from "lodash";`, 1],
      // supported or no-op cases
      [`import { isNil } from "lodash/isNil";`, 0],
      [`import { isNil } from "lodash-es";`, 0],
      [`import { every } from "lodash/fp";`, 0],
    ])("%s", (input, expectWarnings) => {
      void wrapper(input);
      expect(warnMock).toHaveBeenCalledTimes(expectWarnings);
    });
  });
});
