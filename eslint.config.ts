import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettierConfig from "eslint-config-prettier";
// TODO: add in storybook config
// TODO: add in typescript support

const eslintConfig = defineConfig([
  ...nextVitals,
  prettierConfig,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Additional ignores:
    ".tmp/**",
    ".storybook/**",
  ]),
]);

export default eslintConfig;
