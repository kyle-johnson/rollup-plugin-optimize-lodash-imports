import { LODASH_METHODS } from "./lodash-methods.generated";

/**
 * Map from lowercase method name to canonical camelCase.
 * e.g., "isnil" --> "isNil"
 */
const METHOD_MAP = new Map<string, string>(
  LODASH_METHODS.map((m) => [m.toLowerCase(), m]),
);

const PREFIX_LENGTH = "lodash.".length;

/**
 * Check if a source string is a lodash method package (e.g., "lodash.isnil").
 *
 * Returns the canonical method name ("isNil") if it is, or undefined if there
 * is no match.
 */
export function getLodashMethodFromPackage(source: string): string | undefined {
  if (!source.startsWith("lodash.")) {
    return;
  }
  return METHOD_MAP.get(source.slice(PREFIX_LENGTH));
}
