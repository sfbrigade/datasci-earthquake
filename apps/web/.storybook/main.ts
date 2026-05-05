import type { StorybookConfig } from "@storybook/nextjs-vite";
import { mergeConfig } from 'vite';
import { fileURLToPath } from 'url';
import path, { dirname } from 'path';

// Recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const config: StorybookConfig = {
  // NOTE: more advanced sort is possible if needed: https://storybook.js.org/docs/writing-stories/naming-components-and-hierarchy
  stories: [
    "../src/stories/Welcome.mdx",
    // components first
    "../src/components/**/*.mdx",
    "../src/components/**/*.stories.@(js|jsx|mjs|ts|tsx)",
    // tokens next
    "../src/stories/*.mdx",
    "../src/stories/*.stories.@(js|jsx|mjs|ts|tsx)",
    // subfolders last (including examples)
    "../src/stories/*/**/*.mdx",
    "../src/stories/*/**/*.stories.@(js|jsx|mjs|ts|tsx)",
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
  refs: {
    'design-system': {
      title: 'Storybook Design System',
      url: 'https://master--5ccbc373887ca40020446347.chromatic.com/',
      expanded: false, // Optional, true by default
    },
  },
  staticDirs: ['./public'], // Relative to the .storybook folder
  async viteFinal(config, { configType }) {
    return mergeConfig(config, {
      //production builds use `/storybook` path pointing to the static Storybook build whereas development will simply use the default `/` path on its own localhost port
      base: configType === 'PRODUCTION' ? '/storybook/' : '/',
      resolve: {
        // add an explicit manual fallback for the @ alias that's equivalent to what's in tsconfig.json; this is needed to get the imports working in Storybook for the UI provider and theme (and will likely be needed for other imports as well)
        alias: {
          '@': path.resolve(__dirname, '../src'),
        },
      },
    });
  },
};
export default config;
