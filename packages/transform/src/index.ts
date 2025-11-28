import type { Node } from "acorn";
import MagicString, { type SourceMap } from "magic-string";
import { walk } from "estree-walker";

import { isImportDeclaration, isProgram } from "./guards";
import { computeTransform } from "./compute-transform";

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
  warn = console.error,
  useLodashEs,
  appendDotJs = true,
  optimizeModularizedImports = true,
}: {
  code: string;
  id: string;
  parse: ParseFunction;
  warn?: WarnFunction;
  useLodashEs?: true;
  appendDotJs?: boolean;
  optimizeModularizedImports?: boolean;
}): CodeWithSourcemap | UNCHANGED {
  // before parsing, check if we can skip the whole file
  if (!code.includes("lodash")) {
    return UNCHANGED;
  }

  let ast;
  try {
    ast = parse(code);
  } catch (error) {
    (error as Error).message += ` in ${id}`;
    throw error;
  }

  const transforms: Array<{ start: number; end: number; code: string }> = [];

  walk(ast, {
    enter(node) {
      // top-level node; we need to walk its children to find imports
      if (isProgram(node)) {
        return;
      }

      // skip any nodes that aren't imports
      if (!isImportDeclaration(node)) {
        this.skip();
        return;
      }

      const sourceValue = node.source.value as string;

      // Early exit: not a lodash-related import
      if (!sourceValue.startsWith("lodash")) {
        this.skip();
        return;
      }

      const result = computeTransform(
        node,
        sourceValue,
        useLodashEs,
        appendDotJs,
        id,
        optimizeModularizedImports,
      );

      if (result.action === "warn") {
        warn(result.message);
      } else if (result.action === "transform") {
        transforms.push({
          start: node.start,
          end: node.end,
          code: result.imports.join("\n"),
        });
      }

      this.skip();
    },
  });

  if (transforms.length === 0) {
    return UNCHANGED;
  }

  const magicString = new MagicString(code);
  for (const transform of transforms) {
    magicString.overwrite(transform.start, transform.end, transform.code);
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
