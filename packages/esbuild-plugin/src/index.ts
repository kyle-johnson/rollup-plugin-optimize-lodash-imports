import fs from "fs";

import * as acorn from "acorn";
import { Loader, Plugin } from "esbuild";
import {
  ParseFunction,
  transform,
  UNCHANGED,
} from "@optimize-lodash/transform";
import { tsPlugin } from "acorn-typescript";

const wrappedParse: ParseFunction = (code) =>
  acorn.parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    locations: true,
  });

const wrappedTypescriptParse: ParseFunction = (code) =>
  // @ts-expect-error type issues, probably due to differing acorn versions
  acorn.Parser.extend(tsPlugin()).parse(code, {
    ecmaVersion: "latest",
    sourceType: "module",
    locations: true,
  });

const selectLoader = (path: string): Loader => {
  const extension = path.split(".").at(-1);
  switch (extension) {
    case "mts":
    case "ts": {
      return "ts";
    }
    case "tsx": {
      return "tsx";
    }
    case "mjs":
    case "js": {
      return "js";
    }
    case "jsx": {
      return "jsx";
    }
    default: {
      throw new Error(`Unexpected extension: ${extension}`);
    }
  }
};

// eslint-disable-next-line unicorn/prefer-set-has -- faster than Set for a small number of items
const TS_EXTENSIONS = ["ts", "tsx", "mts"];
const isTypescriptPath = (path: string): boolean =>
  TS_EXTENSIONS.includes(path.split(".").at(-1)!);

export type PluginOptions = {
  useLodashEs?: true;
  appendDotJs?: boolean;
  /**
   * Default: true. When true, imports from individual lodash method packages
   * (e.g., lodash.isnil, lodash.kebabcase) are transformed to optimized imports.
   * Set to false to disable this behavior.
   */
  optimizeModularizedImports?: boolean;
};

// TODO: filter https://golang.org/pkg/regexp/
export function lodashOptimizeImports({
  useLodashEs,
  appendDotJs = true,
  optimizeModularizedImports,
}: PluginOptions = {}): Plugin {
  const cache = new Map<
    string,
    | { input: string; output: string; loader: Loader }
    | { input: string; output: UNCHANGED; loader?: never }
  >();

  return {
    name: "lodash-optimize-imports",
    setup(build) {
      build.onLoad(
        { filter: /\.(mjs|mts|js|ts|jsx|tsx)$/ },
        async ({ path }) => {
          const input = await fs.promises.readFile(path, "utf8");
          const cached = cache.get(path); // TODO: unit test the cache

          // the input hasn't changed since we last processed it + we have a cached result
          if (cached && input === cached.input) {
            return cached.output === UNCHANGED
              ? undefined
              : { contents: cached.output, loader: cached.loader };
          }

          const result = transform({
            code: input,
            id: path,
            // acorn is far more battle-tested than acorn-typescript,
            // so we only use acorn-typescript when we have to
            parse: isTypescriptPath(path)
              ? wrappedTypescriptParse
              : wrappedParse,
            useLodashEs,
            appendDotJs,
            optimizeModularizedImports,
          });
          if (result === UNCHANGED) {
            cache.set(path, { input, output: UNCHANGED });
            return;
          }

          const output = result.code;
          const loader = selectLoader(path);
          cache.set(path, { input, output, loader });
          return { contents: output, loader };
        },
      );
    },
  };
}
