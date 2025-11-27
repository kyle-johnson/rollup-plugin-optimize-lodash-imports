import type {
  ImportSpecifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
} from "estree";

import { isImportSpecifierArray, isSingleNamespaceImport } from "./guards";
import { lodashSpecifiersToEs } from "./lodash-specifiers-to-es";
import { lodashSpecifiersToCjs } from "./lodash-specifiers-to-cjs";

/**
 * Search the import for a reference to `chain()`. Does not check
 * if the import is from `lodash` or another package.
 */
function hasChainImport(specifiers: Array<ImportSpecifier>): boolean {
  return specifiers.some(({ imported }) => imported.name === "chain");
}

function createChainWarning(id: string): { action: "warn"; message: string } {
  return {
    action: "warn",
    message: `Detected an import of chain() from lodash within ${id}\nchain() is incompatible with @optimize-lodash.`,
  };
}

/**
 * Gets the `{ default as X }` specifier if present.
 *
 * This is semantically equivalent to a default import but written as a named import.
 */
function getDefaultAsNamedImport(
  items: ImportDeclaration["specifiers"],
): ImportSpecifier | undefined {
  return items.find(
    (item): item is ImportSpecifier =>
      item.type === "ImportSpecifier" && item.imported.name === "default",
  );
}

/**
 * Gets named imports **excluding** `{ default as X }`.
 */
function getNonDefaultNamedImports(
  items: ImportDeclaration["specifiers"],
): Array<ImportSpecifier> {
  return items.filter(
    (item): item is ImportSpecifier =>
      item.type === "ImportSpecifier" && item.imported.name !== "default",
  );
}

export function getDefaultImport(
  items: ImportDeclaration["specifiers"],
): ImportDefaultSpecifier | undefined {
  return items.find(
    (item): item is ImportDefaultSpecifier =>
      item.type === "ImportDefaultSpecifier",
  );
}

export function getNamedImports(
  items: ImportDeclaration["specifiers"],
): Array<ImportSpecifier> {
  return items.filter(
    (item): item is ImportSpecifier => item.type === "ImportSpecifier",
  );
}

export function computeTransform(
  node: ImportDeclaration,
  base: "lodash" | "lodash/fp",
  useLodashEs: boolean | undefined,
  appendDotJs: boolean,
  id: string,
):
  | { action: "skip" }
  | { action: "warn"; message: string }
  | { action: "transform"; imports: string } {
  const isFp = base === "lodash/fp";
  const namedImports = getNamedImports(node.specifiers);
  const lineInfo = `on line ${node.loc?.start?.line ?? "unknown"}`;

  // Default import: `import _ from 'lodash'` or `import _, { isNil } from 'lodash'`
  const defaultImport = getDefaultImport(node.specifiers);
  if (defaultImport) {
    if (!useLodashEs) {
      return {
        action: "warn",
        message: `Detected a default lodash or lodash/fp import within ${id} ${lineInfo}.\nThis import cannot be optimized by @optimize-lodash.`,
      };
    }
    if (hasChainImport(namedImports)) {
      return createChainWarning(id);
    }
    const localName = defaultImport.local.name;
    const namespaceImport = `import * as ${localName} from "lodash-es${isFp ? "/fp" : ""}";`;
    return {
      action: "transform",
      imports:
        namedImports.length > 0
          ? [namespaceImport, ...lodashSpecifiersToEs(base, namedImports)].join(
              "\n",
            )
          : namespaceImport,
    };
  }

  // Namespace import: `import * as _ from 'lodash'`
  if (isSingleNamespaceImport(node.specifiers)) {
    if (!useLodashEs) {
      return {
        action: "warn",
        message: `Detected a namespace lodash or lodash/fp import within ${id} ${lineInfo}.\nThis import cannot be optimized by @optimize-lodash.`,
      };
    }
    const localName = node.specifiers[0].local.name;
    return {
      action: "transform",
      imports: `import * as ${localName} from "lodash-es${isFp ? "/fp" : ""}";`,
    };
  }

  // Not all ImportSpecifiers - unsupported format
  if (!isImportSpecifierArray(node.specifiers)) {
    return {
      action: "warn",
      message: `Detected an unsupported lodash or lodash/fp import within ${id} ${lineInfo}.\nThis import cannot be optimized by @optimize-lodash.`,
    };
  }

  // Default-as-named: `import { default as _ } from 'lodash'`
  const defaultAsNamed = getDefaultAsNamedImport(node.specifiers);
  if (defaultAsNamed) {
    if (!useLodashEs) {
      return {
        action: "warn",
        message: `Detected a default lodash or lodash/fp import within ${id} ${lineInfo}.\nThis import cannot be optimized by @optimize-lodash.`,
      };
    }
    const otherNamedImports = getNonDefaultNamedImports(node.specifiers);
    if (hasChainImport(otherNamedImports)) {
      return createChainWarning(id);
    }
    const localName = defaultAsNamed.local.name;
    const namespaceImport = `import * as ${localName} from "lodash-es${isFp ? "/fp" : ""}";`;
    return {
      action: "transform",
      imports:
        otherNamedImports.length > 0
          ? [
              namespaceImport,
              ...lodashSpecifiersToEs(base, otherNamedImports),
            ].join("\n")
          : namespaceImport,
    };
  }

  // Regular named imports: `import { isNil, map } from 'lodash'`
  if (hasChainImport(node.specifiers)) {
    return createChainWarning(id);
  }

  return {
    action: "transform",
    imports: (useLodashEs
      ? lodashSpecifiersToEs(base, node.specifiers)
      : lodashSpecifiersToCjs(base, node.specifiers, appendDotJs)
    ).join("\n"),
  };
}
