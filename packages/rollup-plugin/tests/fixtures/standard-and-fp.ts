import { isNil, negate } from "lodash";
import { every } from "lodash/fp";

const everyNonNil = every(negate(isNil));

export function isNonNilArray(input: unknown): input is Array<unknown> {
  return Array.isArray(input) && everyNonNil(input);
}
