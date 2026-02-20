import React from "react";
import { Box, Stack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Stack direction={{ base: "column", md: "row" }} gap="3.5">
      {children}
    </Stack>
  );
};
