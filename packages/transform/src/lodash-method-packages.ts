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

/**
 * Check if a source looks like a lodash method package but isn't recognized.
 * Used for warning about unknown packages.
 */
export function isUnknownLodashMethodPackage(source: string): boolean {
  if (!source.startsWith("lodash.")) {
    return false;
  }
  const lowercaseMethod = source.slice(7);
  // Must look like a method name (no slashes, not empty)
  return (
    lowercaseMethod.length > 0 &&
    !lowercaseMethod.includes("/") &&
    !METHOD_MAP.has(lowercaseMethod)
  );
}
