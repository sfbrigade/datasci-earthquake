import React from "react";
import { Box, VStack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      pt={{ base: "8", "2xl": "10" }} // TODO: compare 2xl: 10 (40px) to original 44px
      px={{ base: "6", md: "7", "2xl": "9" }}
      zIndex="docked" // TODO: compare "docked" to original value of 10
      w="full"
    >
      <VStack gap="3.5">{children}</VStack>
    </Box>
  );
};
