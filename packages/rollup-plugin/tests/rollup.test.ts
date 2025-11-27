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
  rollupOutputFormat: OutputOptions["format"] = "cjs",
): Promise<string> => {
  const bundle = await rollup({
    input,
    external,
    plugins:
      pluginOptions !== false ? [optimizeLodashImports(pluginOptions)] : [],
    jsx: { mode: "preserve" },
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
      wrapperRollupGenerate(STANDARD_AND_FP, { useLodashEs: true }, "cjs"),
    ).rejects.toThrowErrorMatchingInlineSnapshot(
      `"[plugin optimize-lodash-imports] 'useLodashEs' is true but the output format is not 'es', 'esm' or 'module', it's cjs"`,
    );
  });

  describe("named lodash and lodash/fp imports", () => {
    test("without plugin", async () => {
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
        const code = await wrapperRollupGenerate(
          STANDARD_AND_FP,
          {},
          outputFormat,
        );

        // ensure all imports became more specific
        expect(code).not.toMatch(/["']lodash["']/g);
        expect(code).not.toMatch(/["']lodash\/fp["']/g);

        expect(code).toMatch(/["']lodash\/fp\/every\.js["']/g);
        expect(code).toMatch(/["']lodash\/isNil\.js["']/g);
        expect(code).toMatch(/["']lodash\/negate\.js["']/g);

        // full snapshot
        expect(code).toMatchSnapshot();
      },
    );

    test("with plugin, ES output, & useLodashEs", async () => {
      const code = await wrapperRollupGenerate(
        STANDARD_AND_FP,
        { useLodashEs: true },
        "es",
      );

      // ensure all imports became more specific
      expect(code).not.toMatch(/["']lodash["']/g);
      expect(code).not.toMatch(/["']lodash\/fp["']/g);
      expect(code).toMatch(/["']lodash-es["']/g);

      // full snapshot
      expect(code).toMatchSnapshot();
    });

    test("with plugin, ES output, JSX input (static parseOptions)", async () => {
      const code = await wrapperRollupGenerate(
        `${__dirname}/fixtures/Component.jsx`,
        { useLodashEs: true, parseOptions: { jsx: true } },
        "es",
      );

      // ensure all imports became more specific
      expect(code).not.toMatch(/["']lodash["']/g);
      expect(code).toMatch(/["']lodash-es["']/g);

      // full snapshot
      expect(code).toMatchSnapshot();
    });

    test("with plugin, ES output, JSX input (dynamic parseOptions)", async () => {
      const code = await wrapperRollupGenerate(
        `${__dirname}/fixtures/Component.jsx`,
        {
          useLodashEs: true,
          // dynamically opt-in based on the filename
          parseOptions: (filename) =>
            filename.endsWith(".jsx") ? { jsx: true } : {},
        },
        "es",
      );

      // ensure all imports became more specific
      expect(code).not.toMatch(/["']lodash["']/g);
      expect(code).toMatch(/["']lodash-es["']/g);

      // full snapshot
      expect(code).toMatchSnapshot();
    });
  });
});
