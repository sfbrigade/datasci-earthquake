import React from "react";
import { Box, VStack, Stack } from "@chakra-ui/react";
interface CardContainerProps {
  padded?: boolean;
  stackDirectionResponsive?: boolean;
  children: React.ReactNode;
}

export const CardContainer = ({
  padded = true,
  stackDirectionResponsive = false,
  children,
}: CardContainerProps) => {
  return stackDirectionResponsive ? (
    <Stack direction={{ base: "column", md: "row" }} gap="3.5">
      {children}
    </Stack>
  ) : (
    <Box
      px={padded ? "8" : "0"}
      py={padded ? "8" : "0"}
      zIndex="docked"
      w="full"
    >
      <VStack gap="3.5">{children}</VStack>
    </Box>
  );
};
