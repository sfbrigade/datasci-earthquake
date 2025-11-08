import { defineConfig, globalIgnores } from "eslint/config";

import prettier from "eslint-plugin-prettier";
import js from "@eslint/js";

import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({
  baseDirectory: __dirname,
  recommendedConfig: js.configs.recommended,
  allConfig: js.configs.all,
});

export default defineConfig([
  {
    extends: compat.extends(
      "next",
      "next/core-web-vitals",
      "plugin:prettier/recommended",
      "plugin:storybook/recommended"
    ),

    plugins: {
      prettier,
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
  ]),
]);
