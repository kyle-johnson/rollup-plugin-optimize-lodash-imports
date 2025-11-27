import type {
  BaseNode,
  ImportDeclaration,
  ImportDefaultSpecifier,
  ImportNamespaceSpecifier,
  ImportSpecifier,
  Program,
} from "estree";

export function isImportDeclaration(node: BaseNode): node is ImportDeclaration {
  return node.type === "ImportDeclaration";
}

export function isProgram(node: BaseNode): node is Program {
  return node.type === "Program";
}

export function isImportSpecifierArray(
  items: ImportDeclaration["specifiers"],
): items is Array<ImportSpecifier> {
  return items.every((item) => item.type === "ImportSpecifier");
}

export function isSingleDefaultImport(
  items: ImportDeclaration["specifiers"],
): items is [ImportDefaultSpecifier] {
  return items.length === 1 && items[0].type === "ImportDefaultSpecifier";
}

export function isSingleNamespaceImport(
  items: ImportDeclaration["specifiers"],
): items is [ImportNamespaceSpecifier] {
  return items.length === 1 && items[0].type === "ImportNamespaceSpecifier";
}
