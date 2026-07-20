import React, { Children } from "react";
import { Box, VStack, Stack, Grid, GridItem } from "@chakra-ui/react";
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
    <Grid
      zIndex="docked"
      w="full"
      templateRows="repeat(2, 1fr)"
      templateColumns={{ base: "1fr", lg: "repeat(2, minmax(0, 1fr))" }}
      gap="3.5"
    >
      {Children.map(children, (child, index) => (
        <GridItem key={index}>
          <Box>{child}</Box>
        </GridItem>
      ))}
    </Grid>
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
