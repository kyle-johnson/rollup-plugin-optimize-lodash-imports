import type {
  BaseNode,
  ImportDeclaration,
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
  items: ImportDeclaration["specifiers"]
): items is Array<ImportSpecifier> {
  return items.every((item) => item.type === "ImportSpecifier");
}
