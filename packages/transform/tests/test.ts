import * as acorn from "acorn";

import { CodeWithSourcemap, transform, UNCHANGED } from "../src";

const warnMock = jest.fn<void, [string]>();
beforeEach(() => {
  warnMock.mockReset();
});

// implementors must supply their own parse method
const parse = (code: string) =>
  acorn.parse(code, { sourceType: "module", ecmaVersion: "latest" });

// save us from repeatedly setting parse/warn/id
const transformWrapper = (code: string, useLodashEs?: true) =>
  transform({
    code,
    id: "id-only-matters-for-sourcemap",
    parse,
    warn: warnMock,
    useLodashEs,
  });

test("when parse throws, transform throws", () => {
  const parseMock = jest.fn(() => {
    throw new Error("expected exception");
  });
  expect(() =>
    transform({
      code: "import { isNil } from 'lodash';",
      warn: warnMock,
      id: "random-code-id",
      parse: parseMock,
    })
  ).toThrow();
});

describe("lodash transforms", () => {
  test("code without lodash is not parsed", () => {
    const parseMock = jest.fn();
    expect(
      transform({ code: "hello world", parse: parseMock, id: "my-id" })
    ).toEqual(UNCHANGED);
    expect(parseMock).not.toHaveBeenCalled();
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
      cjs: transformWrapper(input),
      es: transformWrapper(input, true),
    };

    if (expectedOutput === UNCHANGED) {
      // eslint-disable-next-line jest/no-conditional-expect
      expect(output.cjs).toBeNull();
      // eslint-disable-next-line jest/no-conditional-expect
      expect(output.es).toBeNull();
    } else {
      for (const key of ["cjs", "es"] as const) {
        expect(output[key]).not.toEqual(UNCHANGED);
        const { code, map } = output[key] as CodeWithSourcemap;

        // verify actual output matches our expectation
        expect(code).toEqual(expectedOutput[key]);

        // verify the output is parsable code
        expect(() =>
          acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" })
        ).not.toThrow();

        // verify sourcemap exists
        expect(map.toString().length).toBeGreaterThan(0);
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
      void transformWrapper(input);
      expect(warnMock).toHaveBeenCalledTimes(expectWarnings);
    });
  });
});
