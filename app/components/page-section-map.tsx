"use client";

import React from "react";
import { Box } from "@chakra-ui/react";

interface PageSectionMapProps {
  children: React.ReactNode;
}

// TODO: combine this with `page-section`
const PageSectionMap: React.FC<PageSectionMapProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return (
    <Box w="base" h={{ base: "323px", md: "411px", xl: "462px" }} m="auto">
      <Box h="100%" border="1px solid" borderColor="grey.400" overflow="hidden">
        {children}
      </Box>
    </Box>
  );
};

export default PageSectionMap;
