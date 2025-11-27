import type { ImportSpecifier } from "estree";

/**
 * Turns a generic lodash import into a specific import using the CommonJS
 * lodash package.
 */
export function lodashSpecifiersToCjs(
  base: "lodash" | "lodash/fp",
  specifiers: Array<ImportSpecifier>,
  appendDotJs: boolean,
): Array<string> {
  return specifiers.map(
    ({ imported, local }) =>
      `import ${
        imported.name !== local.name ? local.name : imported.name
      } from "${base}/${imported.name}${appendDotJs ? ".js" : ""}";`,
  );
}
