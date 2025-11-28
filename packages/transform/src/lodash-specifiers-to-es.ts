import type { MinimalImportSpecifier } from "./lodash-specifiers-to-cjs";

/**
 * Turns a generic lodash import into a specific import referencing the "lodash-es"
 * pacakge. Note that lodash-es cannot be imported from CommonJS.
 */
export function lodashSpecifiersToEs(
  base: "lodash" | "lodash/fp",
  specifiers: ReadonlyArray<MinimalImportSpecifier>,
): Array<string> {
  const isFp = base.endsWith("fp");
  return specifiers.map(
    ({ imported, local }) =>
      `import { ${
        imported.name !== local.name
          ? imported.name + " as " + local.name
          : local.name
      } } from "lodash-es${isFp ? "/fp" : ""}";`,
  );
}
