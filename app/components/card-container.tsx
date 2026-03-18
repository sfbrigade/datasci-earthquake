import React from "react";
import { Box, VStack, Stack } from "@chakra-ui/react";
import { CurrentVariant } from "@/data/constants";
interface CardContainerProps {
  padded?: boolean;
  children: React.ReactNode;
}

export const CardContainer = ({
  padded = true,
  children,
}: CardContainerProps) => {
  return CurrentVariant === "map-centric" ? (
    <Box
      px={padded ? "8" : "0"}
      py={padded ? "8" : "0"}
      zIndex="docked"
      w="full"
    >
      <VStack gap="3.5">{children}</VStack>
    </Box>
  ) : (
    <Stack direction={{ base: "column", md: "row" }} gap="3.5">
      {children}
    </Stack>
  );
};
