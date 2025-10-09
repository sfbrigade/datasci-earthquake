import React from "react";
import { Box, VStack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      pt={{ base: "32px", "2xl": "44px" }}
      px={{ base: "24px", md: "28px", "2xl": "36px" }}
      zIndex={10}
      w="full"
    >
      <VStack gap="14px">{children}</VStack>
    </Box>
  );
};
