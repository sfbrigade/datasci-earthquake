import React from "react";
import { Center, Stack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Center pb="36px" pt="16px" zIndex={10} w="100vw">
      <Stack
        justifyContent="space-between"
        direction={{ base: "column", md: "row" }}
        spacing="16px"
        w={{ base: "full", xl: "7xl" }}
        px={{ base: "24px", md: "28px", xl: "128px" }}
      >
        {children}
      </Stack>
    </Center>
  );
};
