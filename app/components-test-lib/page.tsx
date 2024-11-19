"use client";

import { Box, Heading, VStack, Text, HStack, Divider } from "@chakra-ui/react";
import SearchBar from "../components/search-bar";
import CardHazard from "../components/card-hazard";

const ComponentsTestLib = () => {
  return (
    <Box
      as="section"
      w={{ base: "base", xl: "xl" }}
      p={{
        base: "10px 23px 10px 23px",
        md: "8px 27px 8px 26px",
        xl: "5px 127px 5px 127px",
      }}
      m="auto"
    >
      <Heading as="h1" size="xl" mb={4} color="blue">
        Components Test Library
      </Heading>
      <Divider mb={2} />
      <Heading as="h2" size="md" mb={2}>
        Search Bar
      </Heading>
      <Text mb={4}>
        This section demonstrates different states of the Search Bar component
      </Text>
      <VStack spacing={4} align="start">
        <HStack w="100%">
          <Heading as="h3" size="sm">
            Default
          </Heading>
          <SearchBar />
        </HStack>
        <Divider mb={2} />
      </VStack>
      <Text mb={4}>
        This section demonstrates Hazard Card component
      </Text>
      <VStack spacing={4} align="start">
        <HStack w="100%">
          <Heading as="h3" size="sm">
            With data
          </Heading>
          <CardHazard />
        </HStack>
        <Divider mb={2} />
      </VStack>
    </Box>
  );
};

export default ComponentsTestLib;
