"use client";

import React from "react";
import { Flex, Box } from "@chakra-ui/react";
import Header from "./header";
import Footer from "./footer";

interface LayoutSectionProps {
  children: React.ReactNode;
}

// TODO: pass in Header and Footer instead (alongside children)
const LayoutSection: React.FC<LayoutSectionProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Flex direction="column" align="center" minH="100vh">
      <Header />
      <Box flex="1" as="main" width="100%">
        {children}
      </Box>
      <Footer />
    </Flex>
  );
};

export default LayoutSection;
