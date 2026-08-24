import type { Config } from "jest";

const config: Config = {
  preset: "ts-jest",
  testEnvironment: "node",
  roots: ["<rootDir>/tests"],
  testMatch: ["**/*.test.ts"],
  moduleFileExtensions: ["ts", "js", "json"],
  collectCoverageFrom: ["src/**/*.ts", "!src/types/**", "!src/config/swagger.ts"],
  coverageDirectory: "coverage",
  coverageReporters: ["text", "lcov"],
  setupFilesAfterEnv: [],
  verbose: true,
};

export default config;
