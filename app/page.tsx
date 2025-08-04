import "./globals.css";
import { Box, Flex, Heading, Text, List, HStack, Link } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";

import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

import AddressMapper from "./components/address-mapper";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `home-skeleton.tsx` and vice versa
// TODO: look into if we can use narrow Suspense boundaries instead of `loading.tsx` and achieve the same (or better) perceived loading time effect
// TODO: look into if the initial page load size is too large, especially UX-wise; this may entail redesigning when we grab data (e.g., during client-side rendering instead) and evaluating trade-offs (e.g., traffic of build-time vs run-time API calls); there may be some overlap with the above TODO
const Home = async () => {
  let softStoryData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };
  let tsunamiData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };
  let liquefactionData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };

  try {
    [softStoryData, tsunamiData, liquefactionData] = await Promise.all([
      fetchSoftStories(),
      fetchTsunami(),
      fetchLiquefaction(),
    ]);
  } catch (error: any) {
    console.error("Error: ", error);
  }
  return (
    <Flex direction="column">
      <AddressMapper
        softStoryData={softStoryData}
        tsunamiData={tsunamiData}
        liquefactionData={liquefactionData}
      />
      <Flex
        w={{ base: "full", xl: "7xl" }}
        p={{
          base: "24px 24px 24px 24px",
          md: "36px 28px 16px 28px",
          xl: "96px 128px 96px 128px",
        }}
        m="auto"
        gap="46px"
      >
        <HStack alignItems={"start"}>
          <div>
            <Heading as="h2">
              <Text
                as="span"
                textStyle="headerBig"
                layerStyle="headerMain"
                color="blue"
                fontWeight="300"
              >
                How to be
                <br />
                earthquake-ready
              </Text>
            </Heading>
            <Text as="p" mt="2" textStyle="textBig" layerStyle="text">
              Whether you’re a renter, homeowner, or property manager, these
              resources can help you make confident, informed decisions around
              earthquake safety.
            </Text>
            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Know the lingo
              </Text>
            </Heading>
            <Text as="p" mt="2">
              You’ve seen words like “soft story” and “retrofit” floating
              around, but what do they actually mean?
            </Text>

            <List.Root textStyle="textMedium" layerStyle="list">
              <List.Item>
                A{" "}
                <Text as="span" textStyle="textSemibold">
                  soft story
                </Text>{" "}
                building is a structure that contains an open-floor (or “soft”)
                level, such as a garage or retail space, below one or more
                living spaces.
              </List.Item>
              <List.Item>
                <Text as="span" textStyle="textSemibold">
                  Earthquake retrofitting
                </Text>{" "}
                is the process of strengthening a building to make it safer in
                an earthquake, such as adding structural reinforcements or
                upgrading the foundation to better withstand shaking.
              </List.Item>
              <List.Item>
                San Francisco’s{" "}
                <Text as="span" textStyle="textSemibold">
                  Mandatory Soft Story Retrofit Ordinance
                </Text>
                , enacted in 2013, requires all multi-unit soft story buildings
                built before 1978 to be retrofitted in order to minimize the
                risk of earthquake damage. Soft-story homes with 1 to 4 units
                are still vulnerable to earthquake damage, even though the
                ordinance does not legally require them to be retrofitted.
              </List.Item>
            </List.Root>

            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Plan ahead
              </Text>
            </Heading>
            <Text as="p" mt="2">
              These quick and easy steps will help you stay safe during future
              earthquakes.
            </Text>

            <List.Root textStyle="textMedium" layerStyle="list">
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.ready.gov/earthquakes"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn how to protect yourself
                </Link>{" "}
                in an earthquake.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.ready.gov/kit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Prep your emergency kit
                </Link>{" "}
                with first aid supplies, batteries, and other essentials.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://myshake.berkeley.edu/"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download the MyShake app
                </Link>{" "}
                to get early warnings when an earthquake is detected.
              </List.Item>
            </List.Root>

            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Find retrofitting services (if applicable)
              </Text>
            </Heading>
            <Text as="p" mt="2">
              If you own a building in need of retrofitting, the following
              resources can help you get started.
            </Text>

            <List.Root textStyle="textMedium" layerStyle="list">
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ess-retrofit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </Link>{" "}
                about what’s involved in a seismic retrofit.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/resources/find-a-contractor/"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find a licensed contractor
                </Link>{" "}
                who can perform the right updates to your home.
              </List.Item>
              <List.Item>
                Check your eligibility for an{" "}
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ebb-retrofit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Earthquake Brace and Bolt
                </Link>{" "}
                grant or{" "}
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ess-retrofit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Earthquake Soft-Story
                </Link>{" "}
                retrofit grant.
              </List.Item>
            </List.Root>

            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Know your renters’ rights
              </Text>
            </Heading>
            <Text as="p" mt="2">
              If you’re a renter in a non-compliant building, liquefaction area,
              or tsunami zone, you may want to look into these additional
              resources.
            </Text>
            <List.Root textStyle="textMedium" layerStyle="list">
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Search for renters earthquake insurance
                </Link>{" "}
                to cover your personal belongings.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://sftu.org/repairs/"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn about your right
                </Link>{" "}
                to report unsafe living conditions.
              </List.Item>
            </List.Root>
          </div>
          <Box flexShrink={0} display={{ base: "none", lg: "block" }}>
            <Image
              src="/images/earthquake-ready.png"
              alt="about us"
              width="300"
              height="300"
            />
          </Box>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default Home;
