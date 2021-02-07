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

  test.each<[string, { cjs: string; es: string } | UNCHANGED]>([
    [
      `import { isNil } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil";`,
        es: `import { isNil } from "lodash-es";`,
      },
    ],
    [
      `import { isNil as nil } from 'lodash';`,
      {
        cjs: `import nil from "lodash/isNil";`,
        es: `import { isNil as nil } from "lodash-es";`,
      },
    ],
    [
      `import { isNil, isString } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil";\nimport isString from "lodash/isString";`,
        es: `import { isNil } from "lodash-es";\nimport { isString } from "lodash-es";`,
      },
    ],
    [
      `import { isNil } from 'lodash';\nimport { isString } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil";\nimport isString from "lodash/isString";`,
        es: `import { isNil } from "lodash-es";\nimport { isString } from "lodash-es";`,
      },
    ],
    [
      `import { isNil, isString as str } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil";\nimport str from "lodash/isString";`,
        es: `import { isNil } from "lodash-es";\nimport { isString as str } from "lodash-es";`,
      },
    ],
    [
      `import { some } from 'lodash/fp';`,
      {
        cjs: `import some from "lodash/fp/some";`,
        es: `import { some } from "lodash-es/fp";`,
      },
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
    [`import { extend } from "lodash-es/fp";`, UNCHANGED],
  ])("%s", (input, expectedOutput) => {
    const output = {
      cjs: wrapper(input),
      es: wrapper(input, { useLodashEs: true }),
    };
    if (expectedOutput === UNCHANGED) {
      expect(output.cjs).toBeNull();
      expect(output.es).toBeNull();
    } else {
      for (const key of ["cjs", "es"] as const) {
        expect(output[key]).not.toBeNull();
        const code = (output[key] as SourceDescription).code;

        // verify actual output matches our expectation
        expect(code).toEqual(expectedOutput[key]);

        // verify the output is parsable code
        expect(() =>
          acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" })
        ).not.toThrow();
      }
    }
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
