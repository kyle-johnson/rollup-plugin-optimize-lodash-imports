/**
 * Integration tests, verifying that even with a dead-code minifier, the plugin still
 * results in significantly smaller outputs when lodash imports are inline into the
 * output bundle, as would be required for browser bundles.
 *
 * These tests can take some time to run, due to additional processing overhead:
 * multiple third-party rollup plugins are required to create the bundle.
 */
import { rollup } from "rollup";
import { nodeResolve } from "@rollup/plugin-node-resolve";
import terser from "@rollup/plugin-terser";
import commonjs from "@rollup/plugin-commonjs";

import { optimizeLodashImports } from "../src";

const wrapperRollup = async (
  input: string,
  enableLodashOptimization: boolean,
  enableTerser: boolean,
  optimizeModularizedImports: boolean,
) => {
  // nodeResolve + commonjs = baked in lodash
  const plugins = [nodeResolve(), commonjs()];
  if (enableLodashOptimization) {
    plugins.push(
      optimizeLodashImports({
        exclude: /node_modules/,
        optimizeModularizedImports,
      }),
    );
  }
  if (enableTerser) {
    plugins.push(terser());
  }
  const bundle = await rollup({
    input,
    plugins,
  });
  const { output } = await bundle.generate({ format: "cjs", validate: true });
  return output[0].code;
};

describe("output size is reduced for bundled lodash", () => {
  test.each([
    {
      fixture: "standard-and-fp.js",
      enableTerser: false,
      optimizeModularizedImports: true,
    },
    {
      fixture: "standard-and-fp.js",
      enableTerser: true,
      optimizeModularizedImports: true,
    },
    {
      fixture: "mixed-lodash.js",
      enableTerser: true,
      optimizeModularizedImports: false,
    },
    {
      fixture: "mixed-lodash.js",
      enableTerser: true,
      optimizeModularizedImports: true,
    },
  ] as const)(
    "fixture: $fixtureName, enableTerser: $enableTerser",
    async ({ fixture, enableTerser, optimizeModularizedImports }) => {
      const fixturePath = `${__dirname}/fixtures/${fixture}`;
      const [unoptimized, optimized] = await Promise.all([
        wrapperRollup(
          fixturePath,
          false,
          enableTerser,
          optimizeModularizedImports,
        ),
        wrapperRollup(
          fixturePath,
          true,
          enableTerser,
          optimizeModularizedImports,
        ),
      ]);

      const improvementPercentage =
        (unoptimized.length - optimized.length) / unoptimized.length;

      console.log(
        `Fixture: ${fixture}\nTerser: ${enableTerser ? "yes" : "no"}\nModularized import optimization: ${optimizeModularizedImports ? "yes" : "no"}\nOptimized: ${
          optimized.length
        }\nUnoptimized: ${unoptimized.length}\nSize reduction: ${Math.round(
          improvementPercentage * 100,
        )}%`,
      );

      // we expect over a 50% improvement for our fixtures
      expect(unoptimized.length).toBeGreaterThan(optimized.length);
      expect(improvementPercentage).toBeGreaterThan(0.5);
    },
  );
});
