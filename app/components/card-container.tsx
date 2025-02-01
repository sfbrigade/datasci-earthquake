import React from "react";
import { Box, Center, Stack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Center pb="35px" zIndex={10} w="100vw">
      <Stack
        justifyContent="space-between"
        direction={{ base: "column", md: "row" }}
        spacing="15px"
        w={{ base: "95%", lg: "1000px" }}
        px={{ base: 0, md: 2 }}
      >
        {children}
      </Stack>
    </Center>
  );
};
