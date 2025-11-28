import type { ImportSpecifier } from "estree";

export type MinimalImportSpecifier = {
  local: Pick<ImportSpecifier["local"], "name">;
  imported: Pick<ImportSpecifier["imported"], "name">;
};

/**
 * Turns a generic lodash import into a specific import using the CommonJS
 * lodash package.
 */
export function lodashSpecifiersToCjs(
  base: "lodash" | "lodash/fp",
  specifiers: ReadonlyArray<MinimalImportSpecifier>,
  appendDotJs: boolean,
): Array<string> {
  return specifiers.map(
    ({ imported, local }) =>
      `import ${
        imported.name !== local.name ? local.name : imported.name
      } from "${base}/${imported.name}${appendDotJs ? ".js" : ""}";`,
  );
}
