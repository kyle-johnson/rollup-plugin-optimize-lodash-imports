import fs from "fs";

import * as acorn from "acorn";
import { Plugin } from "esbuild";
import {
  ParseFunction,
  transform,
  UNCHANGED,
} from "@optimize-lodash/transform";

const wrappedParse: ParseFunction = (code) =>
  acorn.parse(code, { ecmaVersion: "latest", sourceType: "module" });

export type PluginOptions = {
  useLodashEs?: true;
  appendDotJs?: boolean;
};

// TODO: filter https://golang.org/pkg/regexp/
export function lodashOptimizeImports({
  useLodashEs,
  appendDotJs = true,
}: PluginOptions = {}): Plugin {
  const cache = new Map<
    string,
    { input: string; output: string | UNCHANGED }
  >();

  return {
    name: "lodash-optimize-imports",
    setup(build) {
      build.onLoad({ filter: /.(js|ts|jsx|tsx)$/ }, async ({ path }) => {
        const input = await fs.promises.readFile(path, "utf8");
        const cached = cache.get(path); // TODO: unit test the cache

        if (cached && input === cached.input && cached.output === UNCHANGED) {
          return;
        }

        const result = transform({
          code: input,
          id: path,
          parse: wrappedParse,
          useLodashEs,
          appendDotJs,
        });
        if (result === UNCHANGED) {
          cache.set(path, { input, output: UNCHANGED });
          return;
        }

        const output = result.code;
        cache.set(path, { input, output });
        return { contents: output };
      });
    },
  };
}
