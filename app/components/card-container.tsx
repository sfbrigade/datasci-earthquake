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
  const boxProps = padded
    ? { px: "{spacing.8}", py: "{spacing.8}" }
    : { px: "{spacing.0}", py: "{spacing.0}" };

  return (
    <Box
      px={padded ? "{spacing.8}" : "{spacing.0}"}
      py={padded ? "{spacing.8}" : "{spacing.0}"}
      zIndex="docked"
      w="full"
    >
      <VStack gap="3.5">{children}</VStack>
    </Box>
  );
};
