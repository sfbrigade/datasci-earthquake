import { Suspense } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  Separator,
} from "@chakra-ui/react";
import { Hazards, Info } from "../data/data";
import CardHazard from "../components/card-hazard";
import SearchBarClientWrapper from "./search-bar-client-wrapper";
import Share from "../components/share";
import ShareSkeleton from "../components/share-skeleton";

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
      <VStack gap={6} align="start">
        <HStack w="100%">
          <Box w="400px">
            <SearchBarClientWrapper />
          </Box>
        </HStack>
        <Separator mb={3} />
      </VStack>
      <Heading as="h2" size="md" mb={3}>
        Hazards Card
      </Heading>
      <Text mb={6}>This section demonstrates Hazard Card component</Text>
      <VStack gap={6} align="start">
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
        <Separator mb={3} />
      </VStack>
      <Text mb={6}>This section demonstrates Share menu component</Text>
      <VStack gap={6} align="start">
        <HStack w="100%">
          {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
          <Suspense fallback={<ShareSkeleton />}>
            <Share />
          </Suspense>
        </HStack>
        <Separator mb={3} />
      </VStack>
    </Box>
  );
};

export default ComponentsTestLib;
