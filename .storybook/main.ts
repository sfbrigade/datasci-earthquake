import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  // NOTE: more advanced sort is possible if needed: https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy
  stories: [
    "../stories/Welcome.mdx",
    // components first
    "../app/components/**/*.mdx",
    "../app/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    // tokens next
    "../stories/*.mdx",
    "../stories/*.stories.@(js|jsx|mjs|ts|tsx)",
    // subfolders last (including examples)
    "../stories/*/**/*.mdx",
    "../stories/*/**/*.stories.@(js|jsx|mjs|ts|tsx)",
  ],
  addons: [
    "@chromatic-com/storybook",
    "@storybook/addon-docs",
    "@storybook/addon-onboarding",
    "@storybook/addon-a11y",
    "@storybook/addon-vitest",
  ],
  framework: {
    name: "@storybook/nextjs-vite",
    options: {},
  },
  staticDirs: ["../public"],
  // map Next.js variables to Storybook-prefixed variables
  env: (config) => ({
    ...config,
    // explicitly map a STORYBOOK_ variable based on NODE_ENV
    STORYBOOK_NODE_ENV: process.env.NODE_ENV || "development",
    STORYBOOK_APP_URL:
      process.env.NODE_ENV === "production" &&
      process.env.NEXT_PUBLIC_VERCEL_URL
        ? `https://${process.env.NEXT_PUBLIC_VERCEL_URL}`
        : process.env.STORYBOOK_APP_URL || "https://safehome.report", // Fallback to existing or .env.local value
  }),
};
export default config;
