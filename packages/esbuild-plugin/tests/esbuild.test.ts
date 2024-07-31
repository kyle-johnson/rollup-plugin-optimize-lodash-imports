import path from "path";
import { readFileSync } from "fs";

import acorn from "acorn";
import { tsPlugin } from "acorn-typescript";
import * as esbuild from "esbuild";

import { lodashOptimizeImports } from "../src";

describe("esbuild sanity check", () => {
  // esbuild is under ongoing development, so this test may give an indicator of
  // what might have changed when the change is with esbuild :-)
  test.each<[string]>([["no-transform.js"], ["no-transform.ts"]])(
    "%s",
    (filename) => {
      const result = esbuild.buildSync({
        entryPoints: [path.resolve(__dirname, "fixtures", filename)],
        sourcemap: false,
        write: false,
        format: "cjs",
        target: "es6",
      });

      expect(result.outputFiles).toHaveLength(1);
      expect(
        Buffer.from(result.outputFiles[0].contents).toString("utf8"),
      ).toMatchSnapshot();
    },
  );
});

describe("acorn-typescript sanity check", () => {
  test("parses TypeScript", () => {
    expect(() =>
      // @ts-expect-error some odd type issues, maybe due to differing acorn versions
      acorn.Parser.extend(tsPlugin()).parse(
        readFileSync(
          path.resolve(__dirname, "fixtures", "standard-and-fp.ts"),
        ).toString(),
        {
          ecmaVersion: "latest",
          sourceType: "module",
          locations: true,
        },
      ),
    ).not.toThrow();
  });
});

describe("esbuild with lodashOptimizeImports()", () => {
  test.each<[string]>([["standard-and-fp.js"], ["standard-and-fp.ts"]])(
    "CJS: %s",
    async (filename) => {
      const result = await esbuild.build({
        entryPoints: [path.resolve(__dirname, "fixtures", filename)],
        sourcemap: false,
        write: false,
        format: "cjs",
        target: "es2020",
        plugins: [lodashOptimizeImports()],
      });

      expect(result.outputFiles).toHaveLength(1);
      const code = Buffer.from(result.outputFiles[0].contents).toString("utf8");

      // ensure all imports became more specific
      expect(code).not.toMatch(/["']lodash["']/g);
      expect(code).not.toMatch(/["']lodash\/fp["']/g);

      expect(code).toMatchSnapshot();
    },
  );

  test.each<[string]>([["standard-and-fp.js"], ["standard-and-fp.ts"]])(
    "ESM: %s",
    async (filename) => {
      const result = await esbuild.build({
        entryPoints: [path.resolve(__dirname, "fixtures", filename)],
        sourcemap: false,
        write: false,
        format: "esm",
        target: "es2020",
        plugins: [lodashOptimizeImports({ useLodashEs: true })],
      });

      expect(result.outputFiles).toHaveLength(1);
      const code = Buffer.from(result.outputFiles[0].contents).toString("utf8");

      // ensure all imports became more specific
      expect(code).not.toMatch(/["']lodash["']/g);
      expect(code).not.toMatch(/["']lodash\/fp["']/g);

      // ensure we have some lodash-es imports
      expect(code).toMatch(/["']lodash-es["']/g);

      expect(code).toMatchSnapshot();
    },
  );
});
