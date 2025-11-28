/**
 * Generates the LODASH_METHODS array by downloading and inspecting the lodash package.
 * Run with: pnpm run generate:lodash-methods
 */
import * as fs from "fs";
import * as path from "path";
import { execSync } from "child_process";
import * as os from "os";

const LODASH_VERSION = "4.17.21";
const TARBALL_URL = `https://registry.npmjs.org/lodash/-/lodash-${LODASH_VERSION}.tgz`;

// Files that are not individual methods
const EXCLUDE = new Set([
  // Category modules (re-export groups of methods)
  "array",
  "collection",
  "date",
  "function",
  "lang",
  "math",
  "number",
  "object",
  "seq",
  "string",
  "util",
  // Bundle files
  "core",
  "core.min",
  "index",
  "lodash",
  "lodash.min",
  "fp",
  // Wrapper/chain internals (not useful as individual imports)
  "wrapperAt",
  "wrapperChain",
  "wrapperLodash",
  "wrapperReverse",
  "wrapperValue",
  "commit",
  "next",
  "plant",
  "toIterator",
  "toJSON",
  "value",
  "valueOf",
  // Configuration object
  "templateSettings",
]);

function main() {
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "lodash-gen-"));
  const extractDir = path.join(tmpDir, "extracted");

  try {
    console.log(`Downloading and extracting lodash@${LODASH_VERSION}...`);
    fs.mkdirSync(extractDir);
    execSync(`curl -sL "${TARBALL_URL}" | tar -xz -C "${extractDir}"`);

    // npm tarball extracts to a "package" subdirectory
    const packageDir = path.join(extractDir, "package");
    const methods = fs
      .readdirSync(packageDir)
      .filter(
        (filename) =>
          filename.endsWith(".js") &&
          // internals
          !filename.startsWith("_") &&
          // hand-crafted filters
          !EXCLUDE.has(filename.replace(".js", "")),
      )
      .map((f) => f.replace(".js", ""))
      .sort();

    const output = `// AUTO-GENERATED - DO NOT EDIT
// Run: pnpm run generate:lodash-methods
// Source: lodash@${LODASH_VERSION}

/**
 * All lodash method names in their canonical camelCase form.
 * Generated from lodash package (${methods.length} methods).
 *
 * Should include (at least) the official packages at:
 * https://www.npmjs.com/search?q=keywords%3Alodash-modularized
 */
export const LODASH_METHODS = [
${methods.map((m: string) => `  "${m}",`).join("\n")}
] as const;
`;

    const outPath = path.join(__dirname, "../src/lodash-methods.generated.ts");
    fs.writeFileSync(outPath, output);
    console.log(`Generated ${outPath} with ${methods.length} methods`);
  } finally {
    // Cleanup
    execSync(`rm -rf "${tmpDir}"`);
  }
}

main();
