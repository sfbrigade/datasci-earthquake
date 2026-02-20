import React from "react";
import { Box, Flex } from "@chakra-ui/react";
import Header from "@/components/header";
import Footer from "@/components/footer";

interface LayoutHeightConstrainedProps {
  children: React.ReactNode;
}

export const LayoutHeightConstrained = ({
  children,
}: LayoutHeightConstrainedProps) => {
  return (
    <Flex direction="column" align="center" h="dvh">
      <Header />
      <Box flex="1" as="main" w="full" h="full">
        {children}
      </Box>
      <Box w="full" hideBelow="md">
        <Footer />
      </Box>
    </Flex>
  );
};
