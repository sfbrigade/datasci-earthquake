import { Suspense } from "react";
import { Box, Divider, Heading, HStack, VStack, Text } from "@chakra-ui/react";
import { Hazards, Info } from "../data/data";
import SearchBarClientWrapper from "./search-bar-client-wrapper";
import CardHazard from "../components/card-hazard";
import CardInfo from "../components/card-info";
import Share from "../components/share";

const ComponentsTestLib = () => {
  return (
    <Box
      as="section"
      w={{ base: "full", xl: "7xl" }}
      p={{
        base: "10px 24px 10px 24px",
        md: "8px 28px 8px 28px",
        xl: "6px 128px 6px 128px",
      }}
      m="auto"
    >
      <Heading
        as="h1"
        size="xl"
        mb={6}
        bgColor="blueBackground"
        color="white"
        p="10px"
      >
        Components Test Library
      </Heading>
      <Heading as="h2" size="md" mb={3}>
        Search Bar
      </Heading>
      <Text mb={6}>This section demonstrates the Search Bar component</Text>
      <VStack spacing={6} align="start">
        <HStack w="100%">
          <Box w="400px">
            <SearchBarClientWrapper />
          </Box>
        </HStack>
        <Divider mb={3} />
      </VStack>
      <Heading as="h2" size="md" mb={3}>
        Hazards Card
      </Heading>
      <Text mb={6}>This section demonstrates Hazard Card component</Text>
      <VStack spacing={6} align="start">
        <HStack w="100%">
          {Hazards.map((hazard) => {
            return (
              <CardHazard
                key={hazard.id}
                hazard={hazard}
                hazardData={{ exists: true, last_updated: "" }}
                showData={true}
                isHazardDataLoading={true}
              />
            );
          })}
        </HStack>
        <Divider mb={3} />
      </VStack>
      <Text mb={6}>This section demonstrates Info Card component</Text>
      <VStack spacing={6} align="start">
        <HStack w="100%">
          <CardInfo info={Info[0]} />
        </HStack>
        <Divider mb={3} />
      </VStack>
      <Text mb={6}>This section demonstrates Share menu component</Text>
      <VStack spacing={6} align="start">
        <HStack w="100%">
          <Suspense>
            <Share />
          </Suspense>
        </HStack>
        <Divider mb={3} />
      </VStack>
    </Box>
  );
};

export default ComponentsTestLib;
