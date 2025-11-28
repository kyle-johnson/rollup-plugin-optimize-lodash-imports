import type {
  ImportSpecifier,
  ImportDeclaration,
  ImportDefaultSpecifier,
} from "estree";

import {
  isImportSpecifierArray,
  isSingleDefaultImport,
  isSingleNamespaceImport,
} from "./guards";
import { getLodashMethodFromPackage } from "./lodash-method-packages";
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
  sourceValue: string,
  useLodashEs: boolean | undefined,
  appendDotJs: boolean,
  id: string,
  optimizeModularizedImports: boolean = true,
):
  | { action: "skip" }
  | { action: "warn"; message: string }
  | { action: "transform"; imports: Array<string> } {
  const lineInfo = `on line ${node.loc?.start?.line ?? "unknown"}`;

  // ============================================================
  // Handle lodash.methodname packages (e.g., "lodash.isnil")
  // ============================================================
  if (optimizeModularizedImports && sourceValue.startsWith("lodash.")) {
    const methodFromPackage = getLodashMethodFromPackage(sourceValue);
    if (!methodFromPackage) {
      return {
        action: "warn",
        message:
          `Detected an import from unknown lodash method package "${sourceValue}" within ${id} ${lineInfo}.\n` +
          `This package is not recognized and will not be optimized.`,
      };
    }

    if (!isSingleDefaultImport(node.specifiers)) {
      return {
        action: "warn",
        message:
          `Detected an unexpected import style from ${sourceValue} within ${id} ${lineInfo}.\n` +
          `Expected a default import like: import ${methodFromPackage} from "${sourceValue}";`,
      };
    }

    // Create synthetic specifier to reuse existing transform functions
    const syntheticSpecifier = [
      {
        imported: { name: methodFromPackage },
        local: { name: node.specifiers[0].local.name },
      },
    ];

    return {
      action: "transform",
      imports: useLodashEs
        ? lodashSpecifiersToEs("lodash", syntheticSpecifier)
        : lodashSpecifiersToCjs("lodash", syntheticSpecifier, appendDotJs),
    };
  }

  // ============================================================
  // Handle standard lodash / lodash/fp imports
  // ============================================================
  if (sourceValue !== "lodash" && sourceValue !== "lodash/fp") {
    return { action: "skip" };
  }

  const base = sourceValue as "lodash" | "lodash/fp";
  const isFp = base === "lodash/fp";
  const namedImports = getNamedImports(node.specifiers);

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
          ? [namespaceImport, ...lodashSpecifiersToEs(base, namedImports)]
          : [namespaceImport],
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
      imports: [
        `import * as ${localName} from "lodash-es${isFp ? "/fp" : ""}";`,
      ],
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
          ? [namespaceImport, ...lodashSpecifiersToEs(base, otherNamedImports)]
          : [namespaceImport],
    };
  }

  // Regular named imports: `import { isNil, map } from 'lodash'`
  if (hasChainImport(node.specifiers)) {
    return createChainWarning(id);
  }

  return {
    action: "transform",
    imports: useLodashEs
      ? lodashSpecifiersToEs(base, node.specifiers)
      : lodashSpecifiersToCjs(base, node.specifiers, appendDotJs),
  };
}
