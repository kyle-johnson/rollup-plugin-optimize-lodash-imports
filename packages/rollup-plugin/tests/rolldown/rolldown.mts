/**
 * Prove rolldown. We can't use rolldown with our current Jest setup (rolldown
 * is distributed as ESM), so we're using nodejs builtins and run this directly
 * with tsx.
 */
import { writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import * as assert from "node:assert";
import { type OutputOptions, rolldown } from "rolldown";

import {
  optimizeLodashImports,
  type OptimizeLodashOptions,
} from "../../src/index.js";

// we're still using node 18 types, but import.meta.dirname does exist if run in nodejs 20+
declare global {
  interface ImportMeta {
    dirname: string;
  }
}

// quiet auto-external warnings with a simple auto-external test
const external = (id: string): boolean => /^[^./]/.test(id);

// identical to what's in rollup.test.ts
const wrapperRolldownGenerate = async (
  input: string,
  pluginOptions: OptimizeLodashOptions | false,
  rollupOutputFormat: OutputOptions["format"] = "cjs",
): Promise<string> => {
  const bundle = await rolldown({
    input,
    external,
    plugins:
      pluginOptions !== false ? [optimizeLodashImports(pluginOptions)] : [],
  });
  const { output } = await bundle.generate({
    format: rollupOutputFormat,
  });
  return output[0].code;
};

const JS_INPUT = path.resolve(
  `${import.meta.dirname}/../fixtures/standard-and-fp.js`,
);

/** same as the JS_INPUT, but has some types which will fail a standard JS parser */
const TS_INPUT = path.resolve(
  `${import.meta.dirname}/../fixtures/standard-and-fp.ts`,
);

const assertSnapshot = async (name: string, contents: string) => {
  const snapshotPath = `${import.meta.dirname}/${name}.snapshot`;
  let existingSnapshot: string;
  try {
    existingSnapshot = (await readFile(snapshotPath)).toString();
  } catch {
    // nothing to compare against
    await writeFile(snapshotPath, contents);
    return;
  }

  assert.strictEqual(existingSnapshot, contents);
};

test("js input -> es output", async () => {
  const code = await wrapperRolldownGenerate(JS_INPUT, {}, "es");

  assert.doesNotMatch(code, /["']lodash["']/g);
  assert.doesNotMatch(code, /["']lodash\/fp["']/g);

  assert.match(code, /["']lodash\/fp\/every\.js["']/g);
  assert.match(code, /["']lodash\/isNil\.js["']/g);
  assert.match(code, /["']lodash\/negate\.js["']/g);

  await assertSnapshot("js-to-es", code);
});

test("js input -> cjs output", async () => {
  const code = await wrapperRolldownGenerate(JS_INPUT, {}, "cjs");

  assert.doesNotMatch(code, /["']lodash["']/g);
  assert.doesNotMatch(code, /["']lodash\/fp["']/g);

  assert.match(code, /["']lodash\/fp\/every\.js["']/g);
  assert.match(code, /["']lodash\/isNil\.js["']/g);
  assert.match(code, /["']lodash\/negate\.js["']/g);

  await assertSnapshot("js-to-cjs", code);
});

test("ts input -> es output", async () => {
  const code = await wrapperRolldownGenerate(
    TS_INPUT,
    { parseOptions: { lang: "ts" } },
    "es",
  );

  assert.doesNotMatch(code, /["']lodash["']/g);
  assert.doesNotMatch(code, /["']lodash\/fp["']/g);
  assert.doesNotMatch(code, /input:\s*\bunknown\b/g);

  assert.match(code, /["']lodash\/fp\/every\.js["']/g);
  assert.match(code, /["']lodash\/isNil\.js["']/g);
  assert.match(code, /["']lodash\/negate\.js["']/g);

  await assertSnapshot("ts-to-es", code);
});
