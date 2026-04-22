import type { Meta, StoryObj } from "@storybook/nextjs-vite";

import { ImageTextCard } from "./ImageTextCard";

const meta = {
  title: "Example/ImageTextCard",
  component: ImageTextCard,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
  },
  argTypes: {
    imagePosition: {
      options: ["left", "right"],
      control: { type: "radio" },
    },
  },
} satisfies Meta<typeof ImageTextCard>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    image: "https://via.placeholder.com/150",
    title: "Sample Title",
    description:
      "This is a sample description text that goes along with the image.",
    imagePosition: "left",
  },
};

export const ImageOnRight: Story = {
  args: {
    image: "https://via.placeholder.com/150",
    title: "Image on Right",
    description: "This layout has the image positioned on the right side.",
    imagePosition: "right",
  },
};

export const LongDescription: Story = {
  args: {
    image: "https://via.placeholder.com/200x150",
    title: "Earthquake Safety",
    description:
      "Learn how to prepare for earthquakes in your area. Understand the risks and take the necessary steps to protect yourself and your family.",
    imagePosition: "left",
  },
};
