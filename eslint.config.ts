import { defineConfig, globalIgnores } from "eslint/config";

import { next } from "eslint-config-next";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";

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
    extends: [
      ...next,
      ...nextCoreWebVitals,
      ...compat.extends("plugin:prettier/recommended"),
      ...compat.extends("plugin:storybook/recommended"),
    ],

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
