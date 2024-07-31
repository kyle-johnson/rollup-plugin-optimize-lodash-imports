import { Config } from "jest";

const config: Config = {
  coverageDirectory: "coverage",
  testEnvironment: "node",
  preset: "ts-jest",
  testTimeout: 10_000,
  prettierPath: require.resolve("prettier-2"),
};

export default config;
