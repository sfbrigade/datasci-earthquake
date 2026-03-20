import { Suspense } from "react";
import {
  Box,
  Flex,
  Heading,
  Text,
  List,
  HStack,
  Link,
  Image,
} from "@chakra-ui/react";
import NextLink from "./components/custom-next-link";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

import AddressMapper from "./components/address-mapper";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `home-skeleton.tsx` and vice versa
// NOTE: AddressMapperLoader is kept as a separate async server component so that Home itself is
// synchronous. This allows Next.js to stream the static below-the-fold content immediately without
// waiting for the three GeoJSON fetches that populate the map.
// Resolves the TODOs about narrow Suspense boundaries and initial page load size.
const AddressMapperLoader = async () => {
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
    console.error("Error fetching geo data: ", error);
  }

  return (
    <AddressMapper
      softStoryData={softStoryData}
      tsunamiData={tsunamiData}
      liquefactionData={liquefactionData}
    />
  );
};
// Minimal above-fold skeleton rendered while AddressMapperLoader fetches GeoJSON.
// Using native elements to avoid Chakra sizing-token type constraints.
const AddressMapperSkeleton = () => (
  <div style={{ width: "100%" }}>
    {/* Header placeholder — matches HomeHeader's blue gradient and approximate height */}
    <div
      style={{
        width: "100%",
        minHeight: 175,
        padding: "16px 32px",
        background: "linear-gradient(135deg, #2b6cb0 0%, #1a365d 100%)",
      }}
    >
      {/* Real h1 text so this skeleton registers a text-based LCP candidate early */}
      <h1
        style={{
          color: "white",
          fontSize: "1.25rem",
          fontWeight: 600,
          margin: "0 0 12px",
          lineHeight: 1.3,
        }}
      >
        How safe is your home in an earthquake?
      </h1>
      <div style={{ height: 48, maxWidth: 448, borderRadius: 9999, background: "rgba(255,255,255,0.35)" }} />
    </div>
    {/* Map area placeholder */}
    <div
      style={{
        width: "100%",
        height: "calc(100dvh - 175px - 96px)",
        background: "#e2e8f0",
      }}
    />
  </div>
);


// Home is synchronous — static content streams to the browser immediately.
// The map section (AddressMapper + GeoJSON data) loads inside its own Suspense boundary.
const Home = () => {
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "SafeHome",
    url: "https://sfhazards.com",
    description:
      "Check any San Francisco address for earthquake-related hazards: liquefaction zones, tsunami inundation zones, and soft-story building risk.",
    applicationCategory: "UtilityApplication",
    operatingSystem: "Web",
    offers: { "@type": "Offer", price: "0", priceCurrency: "USD" },
    creator: { "@type": "Organization", name: "SF Civic Tech" },
    spatialCoverage: {
      "@type": "Place",
      name: "San Francisco, CA",
      geo: {
        "@type": "GeoShape",
        box: "37.708 -122.514 37.835 -122.357",
      },
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      {/* NOTE: Suspense around AddressMapperLoader defers GeoJSON fetches so they don't block
          the initial HTML stream. Also satisfies the useSearchParams() CSR-bailout requirement
          per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
      <Suspense fallback={<AddressMapperSkeleton />}>
        <AddressMapperLoader />
      </Suspense>
      <Flex
        w="full"
        p="8"
        justifyContent="space-between"
        gap="11"
        direction={{ base: "column", lg: "row" }}
      >
        <HStack alignItems={"start"} w={{ base: "full", lg: "3/4" }}>
          <div>
            <Heading as="h2">
              <Text
                as="span"
                textStyle="headerBig"
                layerStyle="headerMain"
                color="blue.text"
                fontWeight="light"
              >
                How to be earthquake-ready
              </Text>
            </Heading>
            <Text as="p" mt="2" textStyle="textBig" layerStyle="text">
              Whether you’re a renter, homeowner, or property manager, these
              resources can help you make confident, informed decisions around
              earthquake safety.
            </Text>

            <Heading as="h3" mt="7">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Know the lingo
              </Text>
            </Heading>
            <Text as="p" mt="2">
              You’ve seen words like “soft story” and “retrofit” floating
              around, but what do they actually mean?
            </Text>

            <List.Root textStyle="textMedium" layerStyle="list" mt="0">
              <List.Item>
                A soft story building is a structure that contains an open-floor
                (or “soft”) level, such as a garage or retail space, below one
                or more living spaces.
              </List.Item>
              <List.Item>
                Earthquake retrofitting is the process of strengthening a
                building to make it safer in an earthquake, such as adding
                structural reinforcements or upgrading the foundation to better
                withstand shaking.
              </List.Item>
              <List.Item>
                San Francisco’s Mandatory Soft Story Retrofit Ordinance, enacted
                in 2013, requires all multi-unit soft story buildings built
                before 1978 to be retrofitted in order to minimize the risk of
                earthquake damage. Soft-story homes with 1 to 4 units are still
                vulnerable to earthquake damage, even though the ordinance does
                not legally require them to be retrofitted.
              </List.Item>
            </List.Root>

            <Heading as="h3" mt="7">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Plan ahead
              </Text>
            </Heading>
            <Text as="p" mt="2">
              These quick and easy steps will help you stay safe during future
              earthquakes.
            </Text>

            <List.Root textStyle="textMedium" layerStyle="list" mt="0">
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

            <Heading as="h3" mt="7">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Find retrofitting services (if applicable)
              </Text>
            </Heading>
            <Text as="p" mt="2">
              If you own a building in need of retrofitting, the following
              resources can help you get started.
            </Text>

            <List.Root textStyle="textMedium" layerStyle="list" mt="0">
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

            <Heading as="h3" mt="7">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Know your renters’ rights
              </Text>
            </Heading>
            <Text as="p" mt="2">
              If you’re a renter in a non-compliant building, liquefaction area,
              or tsunami zone, you may want to look into these additional
              resources.
            </Text>
            <List.Root textStyle="textMedium" layerStyle="list" mt="0">
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
        </HStack>
        <Box flexShrink={0}>
          <Image
            src="/images/earthquake-ready.png"
            width="earthquakeReadyImageWidth"
            height="earthquakeReadyImageHeight"
            alt="about us"
          />
          {/* TODO: should this be a NextImage or a Chakra Image? */}
        </Box>
      </Flex>
    </>
  );
};

export default Home;
