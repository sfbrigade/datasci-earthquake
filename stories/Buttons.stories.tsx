import type { Meta, StoryObj } from "@storybook/nextjs-vite";
import {
  Box,
  Button,
  Heading,
  HStack,
  IconButton,
  Stack,
  Text,
} from "@chakra-ui/react";
import { FaAngleRight } from "react-icons/fa";
import { IoIosLink } from "react-icons/io";
import { LuArrowRight, LuX } from "react-icons/lu";

const variants = ["solid", "subtle", "surface", "outline", "ghost", "plain"] as const;
const sizes = ["2xs", "xs", "sm", "md", "lg", "xl", "2xl"] as const;
const palettes = ["gray", "blue", "orange", "green", "red"] as const;

const meta = {
  title: "Design System/Buttons",
  parameters: { layout: "fullscreen" },
} satisfies Meta;

export default meta;
type Story = StoryObj<typeof meta>;

export const Overview: Story = {
  render: () => (
    <Stack gap="10" p={{ base: "6", md: "10" }} maxW="6xl">
      <Box>
        <Heading as="h1" textStyle="headerBig">Buttons</Heading>
        <Text mt="2" textStyle="textMedium" layerStyle="text" maxW="3xl">
          Chakra button patterns currently used by SafeHome, followed by other
          options inherited from Chakra's default Button recipe.
        </Text>
      </Box>

      <Stack gap="5">
        <Box>
          <Heading as="h2" textStyle="headerMedium" layerStyle="headerAlt">
            Used in SafeHome
          </Heading>
          <Text mt="1" textStyle="textSmall" layerStyle="text">
            These mirror configurations found in the application today.
          </Text>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">
            Small primary actions
          </Text>
          <HStack gap="3" flexWrap="wrap">
            <Button size="sm">Start</Button>
            <Button size="sm">Make a plan</Button>
            <Button size="sm">See checklist</Button>
            <Button asChild size="sm">
              <a href="#chakra-variants">Link action <LuArrowRight /></a>
            </Button>
          </HStack>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">
            Share action
          </Text>
          <Box bg="blueBackground" p="4" rounded="md">
            <Button
              aria-label="Copy link to this page"
              variant="ghost"
              background="transparent"
              textStyle="textMedium"
              color="white"
              p="0"
              _hover={{ color: "grey.400" }}
            >
              <IoIosLink /> Copy link to this page
            </Button>
          </Box>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">
            Icon controls
          </Text>
          <HStack gap="5" flexWrap="wrap">
            <IconButton
              aria-label="Open risk layers"
              variant="subtle"
              rounded="full"
              size="md"
            >
              <FaAngleRight />
            </IconButton>
            <IconButton aria-label="Close" variant="ghost" size="xl">
              <LuX />
            </IconButton>
          </HStack>
        </Box>
      </Stack>

      <Stack id="chakra-variants" gap="5">
        <Box>
          <Heading as="h2" textStyle="headerMedium" layerStyle="headerAlt">
            Chakra variants available to SafeHome
          </Heading>
          <Text mt="1" textStyle="textSmall" layerStyle="text" maxW="3xl">
            These are available options, not evidence that SafeHome currently
            uses each one.
          </Text>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">Variants</Text>
          <HStack gap="3" flexWrap="wrap">
            {variants.map((variant) => (
              <Button key={variant} variant={variant}>{variant}</Button>
            ))}
          </HStack>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">
            IconButton variants
          </Text>
          <HStack gap="3" flexWrap="wrap">
            {variants.map((variant) => (
              <IconButton
                key={variant}
                aria-label={variant + " icon button"}
                variant={variant}
              >
                <LuArrowRight />
              </IconButton>
            ))}
          </HStack>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">Sizes</Text>
          <HStack gap="3" align="center" flexWrap="wrap">
            {sizes.map((size) => (
              <Button key={size} size={size}>{size}</Button>
            ))}
          </HStack>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">States</Text>
          <HStack gap="3" flexWrap="wrap">
            <Button>Default</Button>
            <Button disabled>Disabled</Button>
            <Button loading>Loading</Button>
            <Button loading loadingText="Loading">Loading</Button>
          </HStack>
        </Box>

        <Box>
          <Text mb="2" textStyle="textSemibold" layerStyle="text">
            Representative color palettes
          </Text>
          <HStack gap="3" flexWrap="wrap">
            {palettes.map((colorPalette) => (
              <Button key={colorPalette} colorPalette={colorPalette}>
                {colorPalette}
              </Button>
            ))}
          </HStack>
        </Box>
      </Stack>
    </Stack>
  ),
};
