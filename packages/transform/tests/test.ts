/* eslint-disable jest/no-conditional-expect */
import * as acorn from "acorn";

import { CodeWithSourcemap, transform, UNCHANGED, WarnFunction } from "../src";

const warnMock: jest.MockedFunction<WarnFunction> = jest.fn();
beforeEach(() => {
  warnMock.mockReset();
});

// implementors must supply their own parse method
const parse = (code: string) =>
  acorn.parse(code, { sourceType: "module", ecmaVersion: "latest" });

// save us from repeatedly setting parse/warn/id
const transformWrapper = ({
  code,
  useLodashEs,
  appendDotJs,
}: {
  code: string;
  useLodashEs?: boolean;
  appendDotJs: boolean;
}) =>
  transform({
    code,
    id: "id-only-matters-for-sourcemap",
    parse,
    warn: warnMock,
    useLodashEs: useLodashEs ? true : undefined,
    appendDotJs,
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
    }),
  ).toThrow();
});

describe("lodash transforms", () => {
  test("code without lodash is not parsed", () => {
    const parseMock = jest.fn();
    expect(
      transform({ code: "hello world", parse: parseMock, id: "my-id" }),
    ).toEqual(UNCHANGED);
    expect(parseMock).not.toHaveBeenCalled();
  });

  test.each<
    [string, { cjs: string | null; cjsNoAppend: string | null; es: string }]
  >([
    [
      `import { isNil } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil.js";`,
        cjsNoAppend: `import isNil from "lodash/isNil";`,
        es: `import { isNil } from "lodash-es";`,
      },
    ],
    [
      `import { isNil as nil } from 'lodash';`,
      {
        cjs: `import nil from "lodash/isNil.js";`,
        cjsNoAppend: `import nil from "lodash/isNil";`,
        es: `import { isNil as nil } from "lodash-es";`,
      },
    ],
    [
      `import { isNil, isString } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil.js";\nimport isString from "lodash/isString.js";`,
        cjsNoAppend: `import isNil from "lodash/isNil";\nimport isString from "lodash/isString";`,
        es: `import { isNil } from "lodash-es";\nimport { isString } from "lodash-es";`,
      },
    ],
    [
      `import { isNil } from 'lodash';\nimport { isString } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil.js";\nimport isString from "lodash/isString.js";`,
        cjsNoAppend: `import isNil from "lodash/isNil";\nimport isString from "lodash/isString";`,
        es: `import { isNil } from "lodash-es";\nimport { isString } from "lodash-es";`,
      },
    ],
    [
      `import { isNil, isString as str } from 'lodash';`,
      {
        cjs: `import isNil from "lodash/isNil.js";\nimport str from "lodash/isString.js";`,
        cjsNoAppend: `import isNil from "lodash/isNil";\nimport str from "lodash/isString";`,
        es: `import { isNil } from "lodash-es";\nimport { isString as str } from "lodash-es";`,
      },
    ],
    [
      `import { some } from 'lodash/fp';`,
      {
        cjs: `import some from "lodash/fp/some.js";`,
        cjsNoAppend: `import some from "lodash/fp/some";`,
        es: `import { some } from "lodash-es/fp";`,
      },
    ],
    [
      `import _ from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";`,
      },
    ],
    [
      `import lodash from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as lodash from "lodash-es";`,
      },
    ],
    [
      `import fp from 'lodash/fp';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as fp from "lodash-es/fp";`,
      },
    ],
    [
      `import * as _ from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";`,
      },
    ],
    [
      `import * as lodash from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as lodash from "lodash-es";`,
      },
    ],
    [
      `import * as fp from 'lodash/fp';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as fp from "lodash-es/fp";`,
      },
    ],
    [
      `import { default as _ } from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";`,
      },
    ],
    [
      `import { default as lodash } from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as lodash from "lodash-es";`,
      },
    ],
    [
      `import { default as fp } from 'lodash/fp';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as fp from "lodash-es/fp";`,
      },
    ],
    [
      `import { default as _, isNil } from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";`,
      },
    ],
    [
      `import { default as _, isNil, map } from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";\nimport { map } from "lodash-es";`,
      },
    ],
    [
      `import _, { isNil } from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";`,
      },
    ],
    [
      `import _, { isNil, map } from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";\nimport { map } from "lodash-es";`,
      },
    ],
    [
      `import _, { isNil as nil } from 'lodash';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as _ from "lodash-es";\nimport { isNil as nil } from "lodash-es";`,
      },
    ],
    [
      `import fp, { every } from 'lodash/fp';`,
      {
        cjs: UNCHANGED,
        cjsNoAppend: UNCHANGED,
        es: `import * as fp from "lodash-es/fp";\nimport { every } from "lodash-es/fp";`,
      },
    ],
  ])("%s", (input, expectedOutput) => {
    // sanity check our loop below!
    const expectedTransformeds = Object.values(expectedOutput).filter(
      (output) => output !== UNCHANGED,
    ).length;
    const expectedUnchanged = Object.values(expectedOutput).filter(
      (output) => output === UNCHANGED,
    ).length;
    expect.assertions(expectedTransformeds * 5 + expectedUnchanged * 1);

    const output = {
      cjs: transformWrapper({ code: input, appendDotJs: true }),
      cjsNoAppend: transformWrapper({ code: input, appendDotJs: false }),
      es: transformWrapper({
        code: input,
        useLodashEs: true,
        appendDotJs: true,
      }),
    };

    for (const key of ["cjs", "es", "cjsNoAppend"] as const) {
      warnMock.mockReset();

      const expected = expectedOutput[key];
      if (expected === UNCHANGED) {
        expect(output[key]).toEqual(UNCHANGED);
        continue;
      }

      expect(output[key]).not.toEqual(UNCHANGED);
      const { code, map } = output[key] as CodeWithSourcemap;

      // verify actual output matches our expectation
      expect(code).toEqual(expected);

      // verify the output is parsable code
      expect(() =>
        acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" }),
      ).not.toThrow();

      // verify sourcemap exists
      expect(map.toString().length).toBeGreaterThan(0);

      expect(warnMock).not.toHaveBeenCalled();
    }
  });

  describe("don't change code that should not be changed", () => {
    test.each<[string]>([
      // nothing to transform
      [`const k = 1;`],
      [``],
      [`function hello() {}`],
      // ignore non-lodash imports
      [`import hello from "world";`],
      // ignore lodash-es imports (already optimized)
      [`import { isNil } from "lodash-es";`],
      [`import * as _ from "lodash-es";`],
      // ignore already-optimized lodash imports
      [`import isNil from 'lodash/isNil';`],
      [`import isNil from 'lodash/isNil.js';`],
      [`import extend from 'lodash/fp/extend';`],
      [`import extend from 'lodash/fp/extend.js';`],
      [`import { extend } from "lodash-es/fp";`],
    ])("%s", (input) => {
      expect(transformWrapper({ code: input, appendDotJs: true })).toBeNull();
      expect(
        transformWrapper({
          code: input,
          useLodashEs: true,
          appendDotJs: true,
        }),
      ).toBeNull();
    });
  });

  describe("warn on incompatible imports", () => {
    test.each<[string, number]>([
      // chain always warns
      [`import { chain } from "lodash";`, 1],
      [`import { chain as c } from "lodash";`, 1],
      // supported or no-op cases
      [`import { isNil } from "lodash/isNil";`, 0],
      [`import { isNil } from "lodash/isNil.js";`, 0],
      [`import { isNil } from "lodash-es";`, 0],
      [`import { every } from "lodash/fp";`, 0],
      // default imports warn if useLodashEs is not true
      [`import lodash from "lodash";`, 1],
      [`import _ from "lodash";`, 1],
      [`import fp from "lodash/fp";`, 1],
      [`import * as lodash from "lodash";`, 1],
      [`import * as _ from "lodash/fp";`, 1],
      [`import { default as _ } from "lodash";`, 1],
      [`import { default as _, isNil } from "lodash";`, 1],
      [`import _, { isNil } from "lodash";`, 1],
    ])("%s (warnings: %d)", (input, expectWarnings) => {
      void transformWrapper({ code: input, appendDotJs: true });
      expect(warnMock).toHaveBeenCalledTimes(expectWarnings);
    });

    // chain() in mixed imports still warns with useLodashEs
    test.each([
      [`import _, { chain } from "lodash";`],
      [`import { default as _, chain } from "lodash";`],
    ])("mixed import with chain warns with useLodashEs: %s", (code) => {
      void transformWrapper({
        code,
        useLodashEs: true,
        appendDotJs: true,
      });
      expect(warnMock).toHaveBeenCalledTimes(1);
    });
  });
});
