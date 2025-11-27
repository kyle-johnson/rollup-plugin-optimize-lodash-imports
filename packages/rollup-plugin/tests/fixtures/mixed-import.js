import _, { isNil, negate } from "lodash";

export function isNonNilArray(input) {
  return Array.isArray(input) && _.every(input, negate(isNil));
}
