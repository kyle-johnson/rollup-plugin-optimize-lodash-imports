import type { ImportSpecifier } from "estree";

/**
 * Turns a generic lodash import into a specific import using the CommonJS
 * lodash package.
 *
 * @param base "lodash" or "lodash/fp"
 * @param specifiers from an AST; assumes they are all ImportSpecifiers
 * @param appendDotJs optional, default is true; adds '.js' to the end of imports
 */
export function lodashSpecifiersToCjs(
  base: string,
  specifiers: Array<ImportSpecifier>,
  appendDotJs = true
): Array<string> {
  return specifiers.map(
    ({ imported, local }) =>
      `import ${
        imported.name !== local.name ? local.name : imported.name
      } from "${base}/${imported.name}${appendDotJs ? ".js" : ""}";`
  );
}
