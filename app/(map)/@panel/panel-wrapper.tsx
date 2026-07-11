import { Box } from "@chakra-ui/react";

interface PanelWrapperProps {
  children: React.ReactNode;
}

export const PanelWrapper = ({ children }: PanelWrapperProps) => (
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
    {children}
  </Box>
);
