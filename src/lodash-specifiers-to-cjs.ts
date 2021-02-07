import type { ImportSpecifier } from "estree";

/**
 * Turns a generic lodash import into a specific import using the CJS
 * lodash package.
 *
 * @param base "lodash" or "lodash/fp"
 * @param specifiers from an AST, assumes they are all ImportSpecifiers
 */
export function lodashSpecifiersToCjs(
  base: string,
  specifiers: Array<ImportSpecifier>
): Array<string> {
  return specifiers.map(
    ({ imported, local }) =>
      `import ${
        imported.name !== local.name
          ? local.name
          : imported.name
      } from "${base}/${imported.name}";`
  );
}
