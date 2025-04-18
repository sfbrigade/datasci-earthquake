"use client";

import { Box, Heading, VStack, Text, HStack, Divider } from "@chakra-ui/react";
import SearchBar from "../components/search-bar";
import CardHazard from "../components/card-hazard";
import { Hazards } from "../data/data";
import { Info } from "../data/data";
import CardInfo from "../components/card-info";
import Share from "../components/share";

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
      <Heading as="h1" size="xl" mb={4} bgColor="blue" color="white" p="10px">
        Components Test Library
      </Heading>
      <Heading as="h2" size="md" mb={2}>
        Search Bar
      </Heading>
      <Text mb={4}>This section demonstrates the Search Bar component</Text>
      <VStack spacing={4} align="start">
        <HStack w="100%">
          <Box w="400px">
            <SearchBar
              coordinates={[0, 0]}
              onSearchChange={() => {}}
              onAddressSearch={() => {}}
              onCoordDataRetrieve={() => {}}
              onHazardDataLoading={() => {}}
            />
          </Box>
        </HStack>
        <Divider mb={2} />
      </VStack>
      <Heading as="h2" size="md" mb={2}>
        Hazards Card
      </Heading>
      <Text mb={4}>This section demonstrates Hazard Card component</Text>
      <VStack spacing={4} align="start">
        <HStack w="100%">{/* <CardHazard hazard={Hazards[0]} /> */}</HStack>
        <Divider mb={2} />
      </VStack>
      <Text mb={4}>This section demonstrates Info Card component</Text>
      <VStack spacing={4} align="start">
        <HStack w="100%">
          <CardInfo info={Info[0]} />
        </HStack>
        <Divider mb={2} />
      </VStack>
      <Text mb={4}>This section demonstrates Share menu component</Text>
      <VStack spacing={4} align="start">
        <HStack w="100%">
          <Share />
        </HStack>
        <Divider mb={2} />
      </VStack>
    </Box>
  );
};

export default ComponentsTestLib;
