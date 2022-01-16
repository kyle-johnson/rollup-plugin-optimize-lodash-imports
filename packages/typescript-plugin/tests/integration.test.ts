import fs from "fs";
 import path from "path" 
import Ts from "typescript";
import { createProject, ts, InMemoryFileSystemHost } from "@ts-morph/bootstrap";

import lodashTransform from "../src";

export function getCompilerOptions(
  options?: Partial<ts.CompilerOptions>
): ts.CompilerOptions {
  return {
    outDir: "/dist",
    lib: ["/node_modules/typescript/lib/lib.esnext.full.d.ts"],
    module: Ts.ModuleKind.ESNext,
    moduleResolution: Ts.ModuleResolutionKind.NodeJs,
    suppressImplicitAnyIndexErrors: true,
    resolveJsonModule: true,
    skipLibCheck: true,
    target: Ts.ScriptTarget.ESNext,
    //types: [],
    noEmitOnError: true,
    ...(options || {}),
  };
}

describe("typescript integration", () => {
  test("fixtures/standard-and-fp.js", async () => {


    const project = await createProject({
      //        tsConfigFilePath: __dirname + "/../tsconfig.json",

      useInMemoryFileSystem: true,
      compilerOptions: getCompilerOptions({ allowJs: true }),
    });

    const FIXTURE = __dirname + "/fixtures/standard-and-fp.js";
    const CONTENTS = fs.readFileSync(FIXTURE).toString();
    const f = project.createSourceFile("/hello.ts", CONTENTS);
    console.log(f);

/*     const LODASH_TYPE_PATH = path.join(__dirname, "../node_modules/@types/lodash");
    project.fileSystem.mkdirSync("/node_modules")
    project.fileSystem.mkdirSync("/node_modules/@types")
    project.fileSystem.mkdirSync("/node_modules/@types/lodash")
    project.fileSystem.mkdirSync("/node_modules/@types/lodash/fp")
    for (const lodashFile of ["index.d.ts", "package.json"]){
        project.createSourceFile(`/node_modules/@types/lodash/${lodashFile}`, fs.readFileSync(path.join(LODASH_TYPE_PATH, lodashFile)).toString())

    }
 */

    project.createSourceFile("/global.d.ts", `declare module "lodash" { export function isNil(any): boolean; export function negate(Function): Function; }; declare module "lodash/fp" { export function every(Function): Function; }`);
project.addSourceFileAtPathSync("/global.d.ts");
    const program = project.createProgram();
    console.log(program.getSourceFiles().map((file) => file.fileName));

/*     const inFile = program.getSourceFile("/hello.ts");
    console.log(`inFile: ${inFile}`);
 */
    const result = program.emit(
      program.getSourceFile("/hello.ts"),
      undefined,
      undefined,
      false,
             {
        before: [lodashTransform(program as unknown as any, {})],
        after: [],
        afterDeclarations: []
      } as unknown as any
 
    );

    console.log(
      project.formatDiagnosticsWithColorAndContext(result.diagnostics)
    );

    const outFile = project.fileSystem.readFileSync("/dist/hello.js");
    console.log("outFile:\n", outFile);
    expect(outFile).toBeDefined();

 expect(result).toBeDefined();
  });
});
