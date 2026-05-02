import type { Config } from "jest";
// NOTE: "next/jest.js" is used instead of "next/jest" to avoid an issue with ESM imports in the Jest config file within a monorepo where Jest is hoisted to the root and Next.js is in a subfolder. This is a known workaround for such setups.
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files in your test environment
  dir: "./",
});

// Add any custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "./tests/FixJSDOMEnvironment.ts",
  // Add more setup options before each test is run
  setupFilesAfterEnv: ["<rootDir>/src/components/__mocks__/jest.setup.tsx"],
  // Map the "@" alias to the app directory for importing ui components(ex. toaster)
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  testPathIgnorePatterns: ["/e2e-tests/"],
};

// createJestConfig is exported this way to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
