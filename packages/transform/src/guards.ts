import type {
  BaseNode,
  ImportDeclaration,
  ImportDefaultSpecifier,
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

export function isImportDefaultSpecifier(
  item: ImportDeclaration["specifiers"][number],
): item is ImportDefaultSpecifier {
  return item.type === "ImportDefaultSpecifier";
}

export function isSingleDefaultImport(
  items: ImportDeclaration["specifiers"],
): items is [ImportDefaultSpecifier] {
  return items.length === 1 && isImportDefaultSpecifier(items[0]);
}
