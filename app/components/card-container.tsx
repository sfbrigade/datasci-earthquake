import React from "react";
import { Box, VStack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      pt={{ base: "36px", "2xl": "52px" }}
      px={{ base: "24px", md: "32px", xl: "36px" }}
      zIndex={10}
      w="full"
    >
      <VStack gap="14px">{children}</VStack>
    </Box>
  );
};
