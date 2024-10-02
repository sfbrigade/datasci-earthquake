"use client";

import { Box, Heading, VStack, useToast, Text, HStack } from "@chakra-ui/react";
import MockButton from "../components/mock-button";

const ComponentsTestLib = () => {
  const toast = useToast();

  if (process.env.NODE_ENV !== "development") {
    return <div>Page not available in production.</div>;
  }

  const showToast = (message: string) => {
    toast({
      title: "Action Successful.",
      description: message,
      status: "success",
      duration: 5000,
      isClosable: true,
    });
  };

  return (
    <>
      <Box as="section" p="8">
        <Heading as="h1" size="xl" mb={6}>
          Components Test Library
        </Heading>
        <Heading as="h2" size="md" mb={4}>
          Button Variants
        </Heading>
        <Text mb={4}>
          This section demonstrates different states of the Button component
        </Text>
        <HStack spacing={4} align="center">
          <VStack>
            <Heading as="h3" size="sm">
              Default
            </Heading>
            <MockButton
              label="Default"
              onClick={() => showToast("Default Button Clicked")}
            />
          </VStack>
          <VStack>
            <Heading as="h3" size="sm">
              Disabled
            </Heading>
            <MockButton label="Disabled" onClick={() => {}} disabled={true} />
          </VStack>
          <VStack>
            <Heading as="h3" size="sm">
              Loading
            </Heading>
            <MockButton
              label="Loading..."
              onClick={() => showToast("Loading Button Clicked")}
              isLoading={true}
            />
          </VStack>
        </HStack>
      </Box>
    </>
  );
};

export default ComponentsTestLib;
