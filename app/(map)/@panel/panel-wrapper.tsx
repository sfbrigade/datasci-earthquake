"use client";

import { Box, Float } from "@chakra-ui/react";
import { PanelCloseLink } from "@/components/panel-close-link";
import { Suspense } from "react";

interface PanelWrapperProps {
  children: React.ReactNode;
}

function PanelCloseFallback() {
  return <Box boxSize="9" flexShrink={0} aria-hidden="true" />;
}

export const PanelWrapper = ({ children }: PanelWrapperProps) => {
  return (
    <Box
      id="panel-container"
      as="section"
      aria-label="Right panel"
      position="absolute"
      top="0"
      right="0"
      bottom="0"
      zIndex="overlay"
      backgroundColor="white"
      overflowY="auto"
      overflowX="hidden"
      boxShadow="md"
      flexShrink={0}
      w={{ base: "full", md: "2/5" }}
      h="full"
    >
      <Float offset="8">
        <Suspense fallback={<PanelCloseFallback />}>
          <PanelCloseLink />
        </Suspense>
      </Float>

      {children}
    </Box>
  );
};
