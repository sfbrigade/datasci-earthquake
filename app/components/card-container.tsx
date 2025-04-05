import React from "react";
import { Center, Stack } from "@chakra-ui/react";

export const CardContainer = ({ children }: { children: React.ReactNode }) => {
  return (
    <Center pb="35px" pt="16px" zIndex={10} w="100vw">
      <Stack
        justifyContent="space-between"
        direction={{ base: "column", md: "row" }}
        spacing="15px"
        w={{ base: "base", xl: "xl" }}
        px={{ base: "23px", md: "26px", xl: "130px" }}
      >
        {children}
      </Stack>
    </Center>
  );
};
