import path from "path";

import * as esbuild from "esbuild";

import { lodashOptimizeImports } from "../src";

describe("esbuild sanity check", () => {
  // esbuild is under ongoing development, so this test may give an indicator of
  // what might have changed when the change is with esbuild :-)
  test.each<[string]>([["no-transform.js"]])("%s", (filename) => {
    const result = esbuild.buildSync({
      entryPoints: [path.resolve(__dirname, "fixtures", filename)],
      sourcemap: false,
      write: false,
      format: "cjs",
      target: "es6",
    });

    expect(result.outputFiles).toHaveLength(1);
    expect(
      Buffer.from(result.outputFiles[0].contents).toString("utf-8")
    ).toMatchSnapshot();
  });
});

describe("esbuild with lodashOptimizeImports()", () => {
  test.each<[string]>([["standard-and-fp.js"]])("CJS: %s", async (filename) => {
    const result = await esbuild.build({
      entryPoints: [path.resolve(__dirname, "fixtures", filename)],
      sourcemap: false,
      write: false,
      format: "cjs",
      target: "es2020",
      plugins: [lodashOptimizeImports()],
    });

    expect(result.outputFiles).toHaveLength(1);
    const code = Buffer.from(result.outputFiles[0].contents).toString("utf-8");

    // ensure all imports became more specific
    expect(code).not.toMatch(/["']lodash["']/g);
    expect(code).not.toMatch(/["']lodash\/fp["']/g);

    expect(code).toMatchSnapshot();
  });

  test.each<[string]>([["standard-and-fp.js"]])("ESM: %s", async (filename) => {
    const result = await esbuild.build({
      entryPoints: [path.resolve(__dirname, "fixtures", filename)],
      sourcemap: false,
      write: false,
      format: "esm",
      target: "es2020",
      plugins: [lodashOptimizeImports({ useLodashEs: true })],
    });

    expect(result.outputFiles).toHaveLength(1);
    const code = Buffer.from(result.outputFiles[0].contents).toString("utf-8");

    // ensure all imports became more specific
    expect(code).not.toMatch(/["']lodash["']/g);
    expect(code).not.toMatch(/["']lodash\/fp["']/g);

    // ensure we have some lodash-es imports
    expect(code).toMatch(/["']lodash-es["']/g);

    expect(code).toMatchSnapshot();
  });
});
