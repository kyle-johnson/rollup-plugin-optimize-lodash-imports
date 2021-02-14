import type { Node } from "acorn";
import MagicString, { SourceMap } from "magic-string";
import { walk } from "estree-walker";

import {
  isImportDeclaration,
  isImportSpecifierArray,
  isProgram,
} from "./guards";
import { lodashSpecifiersToEs } from "./lodash-specifiers-to-es";
import { lodashSpecifiersToCjs } from "./lodash-specifiers-to-cjs";

// acorn adds these
declare module "estree" {
  interface BaseNodeWithoutComments {
    // added by acorn
    start: number;
    end: number;
  }
}

export type UNCHANGED = null;
export const UNCHANGED = null;

export interface CodeWithSourcemap {
  code: string;
  map: SourceMap;
}
export type ParseFunction = (code: string) => Node;
export type WarnFunction = (message: string) => void;

export function transform({
  code,
  id,
  parse,
  warn,
  useLodashEs,
}: {
  code: string;
  id: string;
  parse: ParseFunction;
  warn?: WarnFunction;
  useLodashEs?: true;
}): CodeWithSourcemap | UNCHANGED {
  // before parsing, check if we can skip the whole file
  if (!code.includes("lodash")) {
    return UNCHANGED;
  }

  let ast;
  try {
    ast = parse(code);
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    error.message += ` in ${id}`;
    throw error;
  }

  // source map generation
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
      if (node.source.value !== "lodash" && node.source.value !== "lodash/fp") {
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
      } else if (warn !== undefined) {
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
}
