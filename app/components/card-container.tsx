import React from "react";
import { Box, Stack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    // previously was Center rather than Box and w="100vw"
    <Box
      pt="16px"
      px={{ base: "24px", md: "28px", xl: "32px" }}
      zIndex={10}
      w="full"
    >
      <Stack
        // previously had px={{ base: "24px", md: "28px", xl: "128px" }} and direction={{ base: "column", md: "row" }}
        // gap was "16px"
        gap="14px"
      >
        {children}
      </Stack>
    </Box>
  );
};
