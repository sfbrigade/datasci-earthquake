import type { Preview, ReactRenderer } from "@storybook/nextjs-vite";
import { withThemeByClassName } from "@storybook/addon-themes";
import { Provider } from "../app/components/ui/provider"; // TODO: get this working with `@/components/ui/provider`
import React from "react";
import {
  Title,
  Subtitle,
  Description,
  Primary,
  Controls,
  Stories,
} from "@storybook/addon-docs/blocks";
import "./preview.css"; // overrides

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },

    a11y: {
      // 'todo' - show a11y violations in the test UI only
      // 'error' - fail CI on a11y violations
      // 'off' - skip a11y checks entirely
      test: "todo",
    },

    docs: {
      toc: true, // 👈 Enables the table of contents
      page: () => (
        <>
          <Title />
          <Subtitle />
          <Description />
          <Primary />
          <Controls />
          <Stories />
        </>
      ),
    },
  },
  // Wrap stories with functionality
  decorators: [
    (Story) => {
      return (
        <Provider>
          <Story />
        </Provider>
      );
    },
    withThemeByClassName({
      defaultTheme: "light",
      themes: { light: "", dark: "dark" },
    }),
  ],
  //👇 Enables auto-generated documentation for all stories
  tags: ["autodocs"],
};

export default preview;
