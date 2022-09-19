/**
 * Basic end-to-end integration tests with Rollup.
 *
 * No mocks/stubs, and output is validated.
 */
import { OutputOptions, rollup } from "rollup";

import { optimizeLodashImports, OptimizeLodashOptions } from "../src";

// quiet auto-external warnings with a simple auto-external test
const external = (id: string): boolean => /^[^./]/.test(id);

/**
 * Simplify tests by running rollup and generating output. Errors within rollup will
 * throw. The lodash plugin can be disabled by passing `false` in place of options.
 *
 * @param input input filename
 * @param pluginOptions set `false` to disable the plugin
 * @param rollupOutputFormat cjs, es, etc
 */
const wrapperRollupGenerate = async (
  input: string,
  pluginOptions: OptimizeLodashOptions | false,
  rollupOutputFormat: OutputOptions["format"] = "cjs"
): Promise<string> => {
  const bundle = await rollup({
    input,
    external,
    plugins:
      pluginOptions !== false ? [optimizeLodashImports(pluginOptions)] : [],
  });
  const { output } = await bundle.generate({
    format: rollupOutputFormat,
    validate: true,
  });
  return output[0].code;
};

const STANDARD_AND_FP = `${__dirname}/fixtures/standard-and-fp.js`;

describe("rollup", () => {
  test("setting `useLodashEs` to true with output format `cjs` throws", async () => {
    await expect(
      wrapperRollupGenerate(STANDARD_AND_FP, { useLodashEs: true }, "cjs")
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `'useLodashEs' is true but the output format is not 'es', 'esm' or 'module', it's cjs"`
    );
  });

  describe("named lodash and lodash/fp imports", () => {
    test("without plugin", async () => {
      expect.assertions(3);
      const code = await wrapperRollupGenerate(STANDARD_AND_FP, false, "cjs");

      // ensure all imports remained untouched
      expect(code).toMatch(/["']lodash["']/g);
      expect(code).toMatch(/["']lodash\/fp["']/g);

      // full snapshot
      expect(code).toMatchSnapshot();
    });

    test.each<[OutputOptions["format"]]>([["cjs"], ["es"]])(
      "with plugin & %s output",
      async (outputFormat) => {
        expect.assertions(3);
        const code = await wrapperRollupGenerate(
          STANDARD_AND_FP,
          {},
          outputFormat
        );

        // ensure all imports became more specific
        expect(code).not.toMatch(/["']lodash["']/g);
        expect(code).not.toMatch(/["']lodash\/fp["']/g);

        // full snapshot
        expect(code).toMatchSnapshot();
      }
    );

    test("with plugin, ES output, & useLodashEs", async () => {
      expect.assertions(4);
      const code = await wrapperRollupGenerate(
        STANDARD_AND_FP,
        { useLodashEs: true },
        "es"
      );

      // ensure all imports became more specific
      expect(code).not.toMatch(/["']lodash["']/g);
      expect(code).not.toMatch(/["']lodash\/fp["']/g);
      expect(code).toMatch(/["']lodash-es["']/g);

      // full snapshot
      expect(code).toMatchSnapshot();
    });
  });
});
