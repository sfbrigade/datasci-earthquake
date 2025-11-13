import type { StorybookConfig } from "@storybook/nextjs-vite";

const config: StorybookConfig = {
  // NOTE: more advanced sort is possible if needed: https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy
  stories: [
    "../stories/welcome.mdx",
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
};
export default config;
