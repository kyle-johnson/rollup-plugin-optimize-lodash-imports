import _ from "lodash";

export function isNonNilArray(input) {
  return Array.isArray(input) && _.every(input, _.negate(_.isNil));
}
