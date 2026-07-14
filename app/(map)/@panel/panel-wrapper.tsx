"use client";
import { Box, CloseButton, Float } from "@chakra-ui/react";
import { useSearchParams } from "next/navigation";
import NextLink from "@/components/custom-next-link";

interface PanelWrapperProps {
  children: React.ReactNode;
}

export const PanelWrapper = ({ children }: PanelWrapperProps) => {
  const searchParams = useSearchParams();

  // TODO:merge this logic with getNavigationHref

  const currentQueryString = searchParams.toString();
  const homeHref = currentQueryString ? `/?${currentQueryString}` : "/";
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
        <NextLink href={homeHref}>
          <CloseButton />
        </NextLink>
      </Float>

      {children}
    </Box>
  );
};
