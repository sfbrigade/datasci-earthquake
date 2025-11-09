import { defineConfig } from "eslint/config";
import js from "@eslint/js";
import prettier from "eslint-plugin-prettier";

// Conditionally import Next.js configs, handling possible missing types.
let next: any = [];
let nextCoreWebVitals: any = [];

try {
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  next = require("eslint-config-next");
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  nextCoreWebVitals = require("eslint-config-next/core-web-vitals");
} catch (e) {
  // If Next.js config packages are not installed, fallback to empty configs.
  next = [];
  nextCoreWebVitals = [];
}

import { globalIgnores } from "eslint/config";

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
