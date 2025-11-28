import fs from "fs";

import { Loader, Plugin } from "esbuild";
import {
  ParseFunction,
  transform,
  UNCHANGED,
} from "@optimize-lodash/transform";
import { parseSync, type ParserOptions } from "oxc-parser";

const getLang = (path: string): ParserOptions["lang"] => {
  const extension = path.split(".").at(-1);
  switch (extension) {
    case "ts":
    case "mts": {
      return "ts";
    }
    case "tsx": {
      return "tsx";
    }
    case "jsx": {
      return "jsx";
    }
    default: {
      return "js";
    }
  }
};

const createParse =
  (path: string): ParseFunction =>
  (code) => {
    const result = parseSync(path, code, {
      sourceType: "module",
      lang: getLang(path),
    });
    if (result.errors.length > 0) {
      throw new Error(result.errors[0].message);
    }
    // oxc-parser returns ESTree-compatible AST
    return result.program as ReturnType<ParseFunction>;
  };

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
        { filter: /\.(mjs|mts|js|cjs|ts|jsx|tsx)$/ },
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
            parse: createParse(path),
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
