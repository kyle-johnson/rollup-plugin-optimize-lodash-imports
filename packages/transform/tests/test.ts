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
  useLodashEs?: true;
  appendDotJs: boolean;
}) =>
  transform({
    code,
    id: "id-only-matters-for-sourcemap",
    parse,
    warn: warnMock,
    useLodashEs,
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

  test.each<[string, { cjs: string; cjsNoAppend: string; es: string }]>([
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
  ])("%s", (input, expectedOutput) => {
    expect.assertions(3 * 4); // 3 keys, 4 assertions per key

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
      expect(output[key]).not.toEqual(UNCHANGED);
      const { code, map } = output[key] as CodeWithSourcemap;

      // verify actual output matches our expectation
      expect(code).toEqual(expectedOutput[key]);

      // verify the output is parsable code
      expect(() =>
        acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" }),
      ).not.toThrow();

      // verify sourcemap exists
      expect(map.toString().length).toBeGreaterThan(0);
    }
  });

  describe("default/namespace import to lodash-es with useLodashEs", () => {
    test.each<[string, string]>([
      // Single default imports
      [`import _ from 'lodash';`, `import * as _ from "lodash-es";`],
      [`import lodash from 'lodash';`, `import * as lodash from "lodash-es";`],
      [`import fp from 'lodash/fp';`, `import * as fp from "lodash-es/fp";`],
      // Namespace imports
      [`import * as _ from 'lodash';`, `import * as _ from "lodash-es";`],
      [`import * as lodash from 'lodash';`, `import * as lodash from "lodash-es";`],
      [`import * as fp from 'lodash/fp';`, `import * as fp from "lodash-es/fp";`],
      // Default-as-named imports: `import { default as _ }`
      [`import { default as _ } from 'lodash';`, `import * as _ from "lodash-es";`],
      [`import { default as lodash } from 'lodash';`, `import * as lodash from "lodash-es";`],
      [`import { default as fp } from 'lodash/fp';`, `import * as fp from "lodash-es/fp";`],
      // Mixed default-as-named + other named imports
      [
        `import { default as _, isNil } from 'lodash';`,
        `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";`,
      ],
      [
        `import { default as _, isNil, map } from 'lodash';`,
        `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";\nimport { map } from "lodash-es";`,
      ],
      // Mixed default + named imports
      [
        `import _, { isNil } from 'lodash';`,
        `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";`,
      ],
      [
        `import _, { isNil, map } from 'lodash';`,
        `import * as _ from "lodash-es";\nimport { isNil } from "lodash-es";\nimport { map } from "lodash-es";`,
      ],
      [
        `import _, { isNil as nil } from 'lodash';`,
        `import * as _ from "lodash-es";\nimport { isNil as nil } from "lodash-es";`,
      ],
      [
        `import fp, { every } from 'lodash/fp';`,
        `import * as fp from "lodash-es/fp";\nimport { every } from "lodash-es/fp";`,
      ],
    ])("%s", (input, expectedOutput) => {
      const result = transformWrapper({
        code: input,
        useLodashEs: true,
        appendDotJs: true,
      });

      expect(result).not.toBeNull();
      const { code, map } = result as CodeWithSourcemap;
      expect(code).toEqual(expectedOutput);

      // verify the output is parsable
      expect(() =>
        acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" }),
      ).not.toThrow();

      // verify sourcemap exists
      expect(map.toString().length).toBeGreaterThan(0);
    });

    test("default import without useLodashEs still returns UNCHANGED", () => {
      const result = transformWrapper({
        code: `import _ from 'lodash';`,
        appendDotJs: true,
      });
      expect(result).toBeNull();
    });

    test("mixed import without useLodashEs still returns UNCHANGED", () => {
      const result = transformWrapper({
        code: `import _, { isNil } from 'lodash';`,
        appendDotJs: true,
      });
      expect(result).toBeNull();
    });

    test("namespace import without useLodashEs still returns UNCHANGED", () => {
      const result = transformWrapper({
        code: `import * as _ from 'lodash';`,
        appendDotJs: true,
      });
      expect(result).toBeNull();
    });

    test("default-as-named import without useLodashEs still returns UNCHANGED", () => {
      const result = transformWrapper({
        code: `import { default as _ } from 'lodash';`,
        appendDotJs: true,
      });
      expect(result).toBeNull();
    });
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

    // Default, namespace, default-as-named, and mixed imports: unchanged without useLodashEs (they transform WITH useLodashEs)
    test.each<[string]>([
      [`import _ from "lodash";`],
      [`import lodash from "lodash";`],
      [`import lodash from "lodash/fp";`],
      [`import * as lodash from "lodash";`],
      [`import * as lodash from "lodash/fp";`],
      [`import { default as _ } from "lodash";`],
      [`import { default as _ } from "lodash/fp";`],
      [`import _, { isNil } from "lodash";`],
      [`import _, { isNil, map } from "lodash";`],
      [`import { default as _, isNil } from "lodash";`],
    ])("%s without useLodashEs returns UNCHANGED", (input) => {
      expect(transformWrapper({ code: input, appendDotJs: true })).toBeNull();
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
    ])("%s", (input, expectWarnings) => {
      void transformWrapper({ code: input, appendDotJs: true });
      expect(warnMock).toHaveBeenCalledTimes(expectWarnings);
    });

    // Default, namespace, default-as-named, and mixed imports warn only without useLodashEs
    test.each<[string]>([
      [`import lodash from "lodash";`],
      [`import _ from "lodash";`],
      [`import fp from "lodash/fp";`],
      [`import * as lodash from "lodash";`],
      [`import * as _ from "lodash/fp";`],
      [`import { default as _ } from "lodash";`],
      [`import { default as _, isNil } from "lodash";`],
      [`import _, { isNil } from "lodash";`],
    ])("%s warns without useLodashEs", (input) => {
      warnMock.mockReset();
      void transformWrapper({ code: input, appendDotJs: true });
      expect(warnMock).toHaveBeenCalledTimes(1);
    });

    test.each<[string]>([
      [`import lodash from "lodash";`],
      [`import _ from "lodash";`],
      [`import fp from "lodash/fp";`],
      [`import * as lodash from "lodash";`],
      [`import * as _ from "lodash/fp";`],
      [`import { default as _ } from "lodash";`],
      [`import { default as _, isNil } from "lodash";`],
      [`import _, { isNil } from "lodash";`],
    ])("%s does NOT warn with useLodashEs", (input) => {
      warnMock.mockReset();
      void transformWrapper({ code: input, useLodashEs: true, appendDotJs: true });
      expect(warnMock).not.toHaveBeenCalled();
    });

    // chain() in mixed imports still warns with useLodashEs
    test("mixed import with chain warns with useLodashEs", () => {
      warnMock.mockReset();
      void transformWrapper({
        code: `import _, { chain } from "lodash";`,
        useLodashEs: true,
        appendDotJs: true,
      });
      expect(warnMock).toHaveBeenCalledTimes(1);
    });

    test("default-as-named import with chain warns with useLodashEs", () => {
      warnMock.mockReset();
      void transformWrapper({
        code: `import { default as _, chain } from "lodash";`,
        useLodashEs: true,
        appendDotJs: true,
      });
      expect(warnMock).toHaveBeenCalledTimes(1);
    });
  });
});
