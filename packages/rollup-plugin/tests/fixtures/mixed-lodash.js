// Standard lodash import
import { kebabCase } from "lodash";

// Same method from individual package (with alias) - this is the duplicate!
import kebabCaseIndividual from "lodash.kebabcase";

export function processData(input) {
  // Use both versions to prevent tree-shaking
  return kebabCase(String(input)) + kebabCaseIndividual(String(input));
}
