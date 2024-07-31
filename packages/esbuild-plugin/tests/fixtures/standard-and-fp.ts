import { isNil, negate } from "lodash";
import { every } from "lodash/fp";

const everyNonNil = every(negate(isNil));

export function isNonNilArray(input: unknown): input is unknown[] {
  return Array.isArray(input) && everyNonNil(input);
}
