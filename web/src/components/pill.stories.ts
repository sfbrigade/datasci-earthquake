import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import Pill from "./pill";

// More on how to set up stories at: https://storybook.js.org/docs/writing-stories#default-export
const meta = {
  title: "Components/Pill",
  component: Pill,
  parameters: {
    // Optional parameter to center the component in the Canvas. More info: https://storybook.js.org/docs/configure/story-layout
    layout: "centered",
  },
  // This component will have an automatically generated Autodocs entry: https://storybook.js.org/docs/writing-docs/autodocs
  tags: ["autodocs"],
  // // More on argTypes: https://storybook.js.org/docs/api/argtypes
  argTypes: {
    exists: {
      control: "select",
      description:
        "value that can be boolean or undefined that represents whether data point exists in dataset",
      options: [undefined, true, false],
    },
    trueData: { control: "text", description: "label for exists=true" },
    falseData: { control: "text", description: "label for exists=false" },
    noData: { control: "text", description: "label for exists=undefined" },
  },
  // // Use `fn` to spy on the onClick arg, which will appear in the actions panel once invoked: https://storybook.js.org/docs/essentials/actions#story-args
  // args: { onClick: fn() },
  args: { exists: undefined },
} satisfies Meta<typeof Pill>;

export default meta;
type Story = StoryObj<typeof meta>;

// More on writing stories with args: https://storybook.js.org/docs/writing-stories/args
export const Default: Story = {
  args: {
    exists: undefined,
    trueData: "Non-Compliant",
    falseData: "Compliant",
    noData: "No Data",
  },
};

export const Exists: Story = {
  args: {
    exists: true,
    trueData: "Non-Compliant",
    falseData: "Compliant",
    noData: "No Data",
  },
};

export const NotExists: Story = {
  args: {
    exists: false,
    trueData: "Non-Compliant",
    falseData: "Compliant",
    noData: "No Data",
  },
};
