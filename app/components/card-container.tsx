import React from "react";
import { Box, Stack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box
      pt="16px"
      px={{ base: "24px", md: "28px", xl: "32px" }}
      zIndex={10}
      w="full"
    >
      <Stack gap="14px">{children}</Stack>
    </Box>
  );
};
