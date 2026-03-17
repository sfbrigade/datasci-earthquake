import React from "react";
import { Box, VStack } from "@chakra-ui/react";
interface CardContainerProps {
  padded?: boolean;
  children: React.ReactNode;
}

export const CardContainer = ({
  padded = true,
  children,
}: CardContainerProps) => {
  return (
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
