import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Header from "@/components/header";
import FooterVerbose from "@/components/footer-verbose";

interface LayoutScrollableProps {
  children: React.ReactNode;
}

export const LayoutScrollable = ({ children }: LayoutScrollableProps) => {
  return (
    <Flex direction="column" align="center" minH="dvh">
      <Header />
      <Box flex="1" as="main" width="full">
        <Box flex="1" as="main" width="full" h="full">
          {children}
        </Box>
      </Box>
      <FooterVerbose />
    </Flex>
  );
};
