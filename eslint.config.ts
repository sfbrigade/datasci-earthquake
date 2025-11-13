import { Config, defineConfig, globalIgnores } from "eslint/config";
import { FlatCompat } from "@eslint/eslintrc";
// import nextPlugin from "@next/eslint-plugin-next"; // Import the Next.js plugin

import js from "@eslint/js";
import globals from "globals";
import tseslint, { ConfigWithExtends } from "typescript-eslint";
import pluginReact from "eslint-plugin-react";
import pluginStorybook from "eslint-plugin-storybook";
import pluginUnicorn from "eslint-plugin-unicorn"; // covers lots of rules and opinions on general typescript styling outside of conventions for the specific frameworks covered by the plugins above as per https://dev.to/jordanahaines/just-use-this-nextjs-eslint-configuration-540
import pluginPrettierRecommended from "eslint-plugin-prettier/recommended";

const jsRecommendedExtended = {
  files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"], // TODO: what about MDX (for Storybook)?
  plugins: { js },
  extends: [js.configs.recommended],
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.node,
      ...globals.es2021,
    },
  },
};

// // TODO: WIP try to add Next.js rules
// import { FlatCompat } from "@eslint/eslintrc";
// import nextPlugin from "@next/eslint-plugin-next"; // Import the Next.js plugin
// const compat = new FlatCompat({
//   baseDirectory: __dirname,
// });
// const nextPluginConfig = {
//   files: ["**/*.ts", "**/*.tsx", "**/*.js", "**/*.jsx"], // Apply to these file types
//   plugins: { nextPlugin },
//   extends: [...compat.extends("plugin:next/recommended")],
// };

// // TODO: figure out if this is needed
// parser: tseslint.parser,
// parserOptions: {
//   ecmaVersion: "latest",
//   sourceType: "module",
//   project: "./tsconfig.json",
//   tsconfigRootDir: import.meta.dirname,
// },

// // TODO: figure out if these other filetypes are needed
// import json from "@eslint/json";
// import markdown from "@eslint/markdown";
// import css from "@eslint/css";
// // Other filetypes
// {
//   files: ["**/*.json"],
//   plugins: { json },
//   language: "json/json",
//   extends: ["json/recommended"],
// },
// {
//   files: ["**/*.jsonc"],
//   plugins: { json },
//   language: "json/jsonc",
//   extends: ["json/recommended"],
// },
// {
//   files: ["**/*.json5"],
//   plugins: { json },
//   language: "json/json5",
//   extends: ["json/recommended"],
// },
// {
//   files: ["**/*.md"],
//   plugins: { markdown },
//   language: "markdown/gfm",
//   extends: ["markdown/recommended"],
// },
// {
//   files: ["**/*.css"],
//   plugins: { css },
//   language: "css/css",
//   extends: ["css/recommended"],
// },

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default defineConfig([
  // JS and TS
  jsRecommendedExtended,
  tseslint.configs.recommended,
  pluginReact.configs.flat.recommended,
  pluginStorybook.configs["flat/recommended"],
  pluginUnicorn.configs.recommended,
  {
    plugins: { pluginUnicorn },
    rules: {
      "unicorn/prevent-abbreviations": "off", // Disable the rule
    },
  },
  ...compat.config({
    extends: ["next"], // TODO: do we need to do something like `import nextPlugin from "@next/eslint-plugin-next"` for this to work?
    settings: {
      next: {
        rootDir: ".",
      },
    },
  }),

  pluginPrettierRecommended, // as per prettier docs at https://github.com/prettier/eslint-plugin-prettier, import eslint-plugin-prettier/recommended and add it as the last item in the configuration array in your eslint.config.js file so that eslint-config-prettier has the opportunity to override other configs
  globalIgnores([
    "**/node_modules/",
    "**/dist/",
    "**/.next/",
    "**/next.config.ts",
    "**/.**/",
    "**/*.d.ts",
    "theme/",
  ]),
]);
