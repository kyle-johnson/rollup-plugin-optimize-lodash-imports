import type { Plugin } from "rollup";
import { createFilter, FilterPattern } from "@rollup/pluginutils";
import MagicString from "magic-string";
import { walk } from "estree-walker";

import {
  isImportDeclaration,
  isImportSpecifierArray,
  isProgram,
} from "./guards";
import { lodashSpecifiersToCjs } from "./lodash-specifiers-to-cjs";
import { lodashSpecifiersToEs } from "./lodash-specifiers-to-es";

declare module "estree" {
  interface BaseNodeWithoutComments {
    // added by acorn
    start: number;
    end: number;
  }
}

export type OptimizeLodashOptions = {
  /**
   * A minimatch pattern, or array of patterns, of files that should be
   * processed by this plugin (if omitted, all files are included by default)
   */
  include?: FilterPattern;
  /**
   * Files that should be excluded, if `include` is otherwise too permissive.
   */
  exclude?: FilterPattern;

  /**
   * Changes *all* lodash imports (but not lodash/fp imports!) to 'lodash-es' imports.
   * Don't use this for CommonJS outputs, the plugin will error should you do so.
   */
  useLodashEs?: boolean;
};

const UNCHANGED = null;

/**
 * Converts lodash imports to be specific, enabling better tree-shaking:
 *
 * `import { isNil } from "lodash";` -> `import { isNil } from "lodash/isNil";`
 *
 * Note that only specific named imports are supported, unlike babel-plugin-lodash. For example,
 * this plugin will print a warning for this import and make no changes to the import:
 *
 * `import _ from "lodash";`
 *
 * Optionally, set `useLodashEs` to true and `lodash` imports will be converted to `lodash-es`
 * imports. Note that it's up to user to include the `lodash-es` module and ensure the output
 * is set to some form of `es` (other output formats will error). An example:
 *
 * `import { isNil } from "lodash";` -> `import { isNil } from "lodash-es";`
 *
 * @param include files/globs to include with this plugin (optional)
 * @param exclude files/globs to exclude from this plugin (optional)
 * @param useLodashEs set `true` to convert imports to use "lodash-es" (optional; default false)
 */
export default function optimizeLodashImports({
  include,
  exclude,
  useLodashEs,
}: OptimizeLodashOptions = {}): Plugin & Required<Pick<Plugin, "transform">> {
  const filter = createFilter(include, exclude);

  return {
    name: "optimize-lodash-imports",
    outputOptions(options) {
      if (useLodashEs && options.format !== "es") {
        this.error(
          `'useLodashEs' is true but the output format is not 'es', it's ${
            options.format ?? "undefined"
          }`
        );
      }
      return UNCHANGED;
    },
    transform(code, id) {
      const warn = this.warn.bind(this);

      // sometimes we can skip the whole file
      if (!filter(id) || !code.includes("lodash")) {
        return UNCHANGED;
      }

      let ast;
      try {
        ast = this.parse(code);
      } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        error.message += ` in ${id}`;
        throw error;
      }

      // easy source map generation
      let magicString: MagicString | undefined;

      walk(ast, {
        enter(node) {
          // top-level node; we need to walk its children to find imports
          if (isProgram(node)) {
            return;
          }

          // skip any nodes that aren't imports (this skips most everything)
          if (!isImportDeclaration(node)) {
            this.skip();
            return;
          }

          // narrow-in on lodash imports we care about
          if (
            node.source.value !== "lodash" &&
            node.source.value !== "lodash/fp"
          ) {
            this.skip();
            return;
          }

          // transform specific "lodash" and "lodash/fp" imports such as:
          // import { isNil } from "lodash";
          if (isImportSpecifierArray(node.specifiers)) {
            magicString = magicString ?? new MagicString(code);

            // modify
            const imports = useLodashEs
              ? lodashSpecifiersToEs(node.source.value, node.specifiers)
              : lodashSpecifiersToCjs(node.source.value, node.specifiers);

            // write
            magicString.overwrite(node.start, node.end, imports.join("\n"));

            // no need to dig deeper
            this.skip();
          } else {
            // help end-users benefit from this plugin (this behavior differs from
            // babel-plugin-lodash which does optimize non-specific imports)
            warn(
              `Detected a default lodash or lodash/fp import within ${id} on line ${
                node.loc?.start?.line ?? "unknown"
              }.\nThis import cannot be optimized by optimize-lodash-imports.`
            );
          }
        },
      });

      if (!magicString) {
        return UNCHANGED;
      }

      return {
        code: magicString.toString(),
        map: magicString.generateMap({
          file: id,
          includeContent: true,
          hires: true,
        }),
      };
    },
  };
}
