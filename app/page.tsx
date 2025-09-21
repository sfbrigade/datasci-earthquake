import "./globals.css";
import { Suspense } from "react";
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
import { HomePageText } from "./data/data";

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
      {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
      <Suspense fallback={null}>
        <AddressMapper
          softStoryData={softStoryData}
          tsunamiData={tsunamiData}
          liquefactionData={liquefactionData}
        />
      </Suspense>
      <Flex
        w={{ base: "full" }}
        p={{
          base: "32px 32px 64px 32px",
        }}
        justifyContent="space-between"
      >
        <HStack alignItems={"start"} w={{ base: "75%" }}>
          <div>
            <Heading as="h2">
              <Text
                as="span"
                textStyle="headerBig"
                layerStyle="headerMain"
                color="blue.text"
                fontWeight="300"
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
                {HomePageText[0].title}
              </Text>
            </Heading>
            <Text as="p" mt="2">
              {HomePageText[0].subtext}
            </Text>
            <List.Root textStyle="textMedium" layerStyle="list" mt="0">
              {HomePageText[0].listItems.map((li, index) => (
                <List.Item key={index}>{li}</List.Item>
              ))}
            </List.Root>

            {HomePageText.slice(1).map((data, index) =>
              data.links !== undefined && data.links.length < 4 ? (
                <div key={index}>
                  <Heading as="h3" mt="7">
                    <Text
                      as="span"
                      textStyle="headerMedium"
                      layerStyle="headerAlt"
                    >
                      {data.title}
                    </Text>
                  </Heading>
                  <Text as="p" mt="1">
                    {data.subtext}
                  </Text>

                  <List.Root textStyle="textMedium" layerStyle="list" mt="0">
                    {data.listItems.map((li, index) => (
                      <List.Item key={index} mt="1">
                        <Link
                          as={NextLink}
                          href={data.links[index]}
                          textDecoration="underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data.linkText[index]}
                        </Link>{" "}
                        {li}
                      </List.Item>
                    ))}
                  </List.Root>
                </div>
              ) : (
                <div key={index}>
                  <Heading as="h3" mt="7">
                    <Text
                      as="span"
                      textStyle="headerMedium"
                      layerStyle="headerAlt"
                    >
                      {data.title}
                    </Text>
                  </Heading>
                  <Text as="p" mt="1">
                    {data.subtext}
                  </Text>

                  <List.Root textStyle="textMedium" layerStyle="list" mt="0">
                    {data.listItems.slice(0, 2).map((li, index) => (
                      <List.Item key={index} mt="1">
                        <Link
                          as={NextLink}
                          href={
                            data.links !== undefined ? data.links[index] : ""
                          }
                          textDecoration="underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {data.linkText !== undefined
                            ? data.linkText[index]
                            : ""}
                        </Link>{" "}
                        {li}
                      </List.Item>
                    ))}
                    <List.Item mt="1">
                      {data.listItems[2]}{" "}
                      <Link
                        as={NextLink}
                        href={data.links !== undefined ? data.links[2] : ""}
                        textDecoration="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {data.linkText !== undefined ? data.linkText[2] : ""}
                      </Link>{" "}
                      {data.listItems[3]}{" "}
                      <Link
                        as={NextLink}
                        href={data.links !== undefined ? data.links[3] : ""}
                        textDecoration="underline"
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        {data.linkText !== undefined
                          ? data.linkText[3]
                          : ""}{" "}
                      </Link>{" "}
                      {data.listItems[4]}
                    </List.Item>
                  </List.Root>
                </div>
              )
            )}
          </div>
        </HStack>
        <Box flexShrink={0} display={{ base: "none", lg: "block" }}>
          <Image
            src="/images/earthquake-ready.png"
            alt="about us"
            width="300"
            height="300"
          />
        </Box>
      </Flex>
    </Flex>
  );
};

export default Home;
