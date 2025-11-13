import { defineConfig } from "eslint/config";
import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-plugin-prettier";
// FIXME: figure out how to properly import the following without errors
// Add type declarations for modules without types
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-expect-error: No types for eslint-config-next
// import next from "eslint-config-next";
// // eslint-disable-next-line @typescript-eslint/ban-ts-comment
// // @ts-expect-error: No types for eslint-config-next/core-web-vitals
// import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

import { globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: pluginJs.configs.recommended,
  allConfig: pluginJs.configs.all,
});

export default defineConfig([
  // TypeScript ESLint recommended configs
  ...tseslint.configs.recommended,

  {
    extends: [
      // ...next,
      // ...nextCoreWebVitals,
      ...compat.extends("plugin:prettier/recommended"),
      ...compat.extends("plugin:storybook/recommended"),
    ],

    languageOptions: {
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2021,
      },
      parser: tseslint.parser,
      parserOptions: {
        ecmaVersion: "latest",
        sourceType: "module",
        project: "./tsconfig.json",
      },
    },

    plugins: {
      prettier,
      "@typescript-eslint": tseslint.plugin,
    },

    rules: {
      "prettier/prettier": "error",
    },
  },
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/.next/",
    "**/next.config.js",
    "**/.**/",
    "**/*.d.ts",
  ]),
]);
