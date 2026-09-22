import { Box, Button, Text } from "@chakra-ui/react";

const dynamicColor = Math.random() > 0.5 ? "blue.600" : "red.600";
const dynamicSpacing = Math.random() > 0.5 ? "4" : "6";

export function Phase0SemanticCases() {
  return (
    <>
      <Box
        p="4"
        display="flex"
        position="absolute"
        color="blue.text"
        fontWeight="bold"
        zIndex="docked"
      />
      <Text textStyle="textSmall" layerStyle="text" />
      <Button>Default</Button>
      <Button size="sm" variant="ghost">Explicit</Button>
      <Box color={dynamicColor} p={dynamicSpacing} />
      <Box _hover={{ color: "grey.400" }} />
      <Box colorPalette="blue" />
      <Box py={{ base: "3.5", md: "4" }} />
    </>
  );
}
