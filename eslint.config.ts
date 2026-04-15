import { defineConfig, globalIgnores } from "eslint/config";
import type { ConfigWithExtends } from "@eslint/config-helpers"; // Import the type
import nextVitals from "eslint-config-next/core-web-vitals";
import prettierPluginRecommended from "eslint-plugin-prettier/recommended";
import storybookPlugin from "eslint-plugin-storybook";

// TODO: add in storybook config

const eslintConfig = defineConfig([
  // globally ignore built files
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",

    // Additional ignores:
    "**/node_modules/",
    "**/dist/",
    "storybook-static/**",
    ".tmp/**",
    ".venv/**",
    "**/playwright-report/**",
  ]),

  // Next.js Core Web Vitals
  nextVitals,

  // Storybook
  storybookPlugin.configs["flat/recommended"] as ConfigWithExtends,

  // Prettier plugin & config (MUST BE LAST)
  // This turns off conflicting rules
  prettierPluginRecommended,

  // enables prettier/prettier as "warn" instead of "error"
  {
    rules: {
      // Enforce prettier formatting rules as ESLint warnings
      "prettier/prettier": "warn",
    },
  },
]);

export default eslintConfig;
