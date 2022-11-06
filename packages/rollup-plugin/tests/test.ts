import type {
  FunctionPluginHooks,
  TransformPluginContext,
  TransformResult,
} from "rollup";
import { ParseFunction, transform } from "@optimize-lodash/transform";

import { optimizeLodashImports, OptimizeLodashOptions } from "../src";

jest.mock("@optimize-lodash/transform");
const sourceTransformerMock = transform as jest.MockedFunction<
  typeof transform
>;

const UNCHANGED = null;
type UNCHANGED = null;

describe("optimizeLodashImports", () => {
  const warnMock: jest.MockedFunction<TransformPluginContext["warn"]> =
    jest.fn();
  const parseMock: jest.MockedFunction<ParseFunction> = jest.fn();
  const wrapperPlugin = (
    input: string,
    id: string,
    options: OptimizeLodashOptions
  ): TransformResult =>
    (optimizeLodashImports(options) as FunctionPluginHooks).transform.call(
      {
        parse: parseMock as ParseFunction,
        warn: warnMock as TransformPluginContext["warn"],
      } as TransformPluginContext,
      input,
      id
    );

  beforeEach(() => {
    sourceTransformerMock.mockReset();
    warnMock.mockReset();
    parseMock.mockReset();
  });

  test("source-transform is called with bound `warn` and `parse` methods", () => {
    const CODE = `import hello from "world";`;
    const SOURCE_ID = "my-source-id";
    // verify binding of warn and parse
    sourceTransformerMock.mockImplementationOnce(({ warn, parse }) => {
      if (warn) {
        warn("warning");
      }
      parse("code to parse");
      return UNCHANGED;
    });

    const result = wrapperPlugin(CODE, SOURCE_ID, {});
    expect(result).toBe(UNCHANGED);

    expect(sourceTransformerMock).toHaveBeenCalledTimes(1);
    expect(sourceTransformerMock).toHaveBeenLastCalledWith(
      expect.objectContaining({
        code: CODE,
        id: SOURCE_ID,
        useLodashEs: undefined,
      })
    );
    expect(warnMock).toHaveBeenCalledTimes(1);
    expect(parseMock).toHaveBeenCalledTimes(1);
  });

  test("by default, no sources are skipped", () => {
    sourceTransformerMock.mockReturnValueOnce(UNCHANGED);
    void wrapperPlugin("hello", "my-file.js", {});
    expect(sourceTransformerMock).toHaveBeenCalled();
  });

  test("excluded sources are skipped", () => {
    sourceTransformerMock.mockReturnValueOnce(UNCHANGED);
    const result = wrapperPlugin("hello", "skip-me.js", { exclude: /skip/ });
    expect(result).toBe(UNCHANGED);
    expect(sourceTransformerMock).not.toHaveBeenCalled();
  });

  test("when include doesn't match a source, the source is excluded", () => {
    sourceTransformerMock.mockReturnValueOnce(UNCHANGED);
    const result = wrapperPlugin("hello", "skip-me.js", { include: /include/ });
    expect(result).toBe(UNCHANGED);
    expect(sourceTransformerMock).not.toHaveBeenCalled();
  });

  test.each<[true | undefined]>([[undefined], [true]])(
    "useLodashEs (%p) is passed to source-transform",
    (useLodashEs) => {
      sourceTransformerMock.mockReturnValueOnce(UNCHANGED);
      const result = wrapperPlugin("hello", "parse-me.js", { useLodashEs });
      expect(result).toBe(UNCHANGED);
      expect(sourceTransformerMock).toHaveBeenCalledTimes(1);
      expect(sourceTransformerMock).toHaveBeenLastCalledWith(
        expect.objectContaining({
          useLodashEs,
        })
      );
    }
  );
});
