import React from "react";
import { Box, VStack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Box px="8" py="8" zIndex="docked" w="full">
      <VStack gap="3.5">{children}</VStack>
    </Box>
  );
};
