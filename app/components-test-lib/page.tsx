"use client";

import { Suspense, useEffect } from "react";
import {
  Box,
  Heading,
  VStack,
  Text,
  HStack,
  Separator,
  Button,
  Code,
} from "@chakra-ui/react";
import { Hazards } from "../data/data";
import CardHazard from "../components/card-hazard";
import Share from "../components/share";
import ShareSkeleton from "../components/share-skeleton";
import SearchBarSkeleton from "@/components/search-bar-skeleton";
import SearchBar from "@/components/search-bar";
import posthog from "posthog-js";
import { useFeatureFlagVariantKey } from "posthog-js/react";
import { PostHogFeature } from "posthog-js/react";

const ComponentsTestLib = () => {
  useEffect(() => {
    if (typeof window !== "undefined") {
      window.posthog = posthog;
    }
  }, []);
  const toggledStates = [true, true, true];
  const setToggledStates = () => {};
  const setLayerToggleObj = () => {};
  const variant = useFeatureFlagVariantKey("show-pink-button");
  const codeString = `posthog.featureFlags.overrideFeatureFlags({ flags: {'show-pink-button': 'control'} })`;

  return (
    <Box
      as="section"
      w={{ base: "full", xl: "7xl" }}
      py={{ base: "2.5", md: "2", xl: "1.5" }}
      px={{ base: "6", md: "12", xl: "32" }}
      m="auto"
    >
      <Heading
        as="h1"
        size="xl"
        mb="6"
        bgColor="blueBackground"
        color="white"
        p="2.5"
      >
        Components Test Library
      </Heading>
      <Heading as="h2" size="md" mb="3">
        Search Bar
      </Heading>
      <Text mb="6">This section demonstrates the Search Bar component</Text>
      <VStack gap="6" align="start">
        <HStack w="full">
          <Box w="sm">
            <Suspense fallback={<SearchBarSkeleton />}>
              {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
              <SearchBar
                inputAddress=""
                onInputAddressChange={() => {}}
                onSearchChange={() => {}}
              />
            </Suspense>
          </Box>
        </HStack>
        <Separator mb="3" />
      </VStack>
      <Heading as="h2" size="md" mb="3">
        Hazards Card
      </Heading>
      <Text mb="6">This section demonstrates Hazard Card component</Text>
      <VStack gap="6" align="start">
        <HStack w="full">
          {Hazards.map((hazard) => {
            return (
              <CardHazard
                key={hazard.id}
                hazard={hazard}
                hazardData={{ exists: true, last_updated: "" }}
                showData={true}
                isHazardDataLoading={true}
                toggledStates={toggledStates}
                setToggledStates={setToggledStates}
                setLayerToggleObj={setLayerToggleObj}
              />
            );
          })}
        </HStack>
        <Separator mb="3" />
      </VStack>
      <Text mb="6">This section demonstrates Share menu component</Text>
      <VStack gap="6" align="start">
        <HStack w="full">
          {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
          <Suspense fallback={<ShareSkeleton />}>
            <Share />
          </Suspense>
        </HStack>
        <Separator mb="3" />
      </VStack>
      <Text mb="6">
        This section demonstrates using Feature Flags for AB testing
      </Text>
      <VStack gap="6" align="start">
        Using the `useFeatureFlagVariantKey` hook:
        {variant === "has-pink" ? (
          <Button colorPalette="pink">has-pink Button</Button>
        ) : (
          <Button colorPalette="blue">control Button</Button>
        )}
        <Separator mb="3" />
        Using the `PostHogFeature` component:
        <PostHogFeature flag="show-pink-button" match="has-pink">
          <Button colorPalette="pink">has-pink Button</Button>
        </PostHogFeature>
        <PostHogFeature flag="show-pink-button" match="control">
          <Button colorPalette="blue">control Button</Button>
        </PostHogFeature>
        <Separator mb="3" />
        You can also test your code by overriding the feature flag in the JS
        console with (replace `control` with `has-pink` to see the other
        variant):
        <Box p="4" bgColor="black" color="white">
          <pre>
            <code>{codeString}</code>
          </pre>
        </Box>
        <Separator mb="3" />
      </VStack>
    </Box>
  );
};

export default ComponentsTestLib;
