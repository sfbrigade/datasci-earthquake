import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface LayoutResponsiveProps {
  children: React.ReactNode;
}

export const LayoutResponsive = ({ children }: LayoutResponsiveProps) => {
  return (
    <>
      <Flex
        direction="column"
        align="center"
        h={{ base: "dvh", md: "auto" }}
        minH={{ base: "none", md: "dvh" }}
      >
        <Header />
        <Box as="main" w="full" h="full" flex="1">
          {children}
        </Box>
        <Box as="footer" w="full" hideBelow="md">
          <Footer />
        </Box>
      </Flex>
    </>
  );
};
