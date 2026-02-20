import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface LayoutScrollableProps {
  children: React.ReactNode;
}

export const LayoutScrollable = ({ children }: LayoutScrollableProps) => {
  return (
    <Flex direction="column" align="center" minH="dvh">
      <Header />
      <Box as="main" width="full" h="full" flexGrow="1">
        {children}
      </Box>
      <Box as="footer" w="full" hideBelow="md">
        <Footer />
      </Box>
    </Flex>
  );
};
