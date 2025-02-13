import { Box, Flex } from "@chakra-ui/react";

import Map from "./components/map";
import "./globals.css";
import Report from "./components/report";
import Information from "./components/information";
import HomeHeader from "./components/home-header";

import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";

const addressLookupCoordinates = {
  geometry: {
    type: "Point",
    coordinates: [-122.408020683, 37.801698301],
  },
};
const coords = addressLookupCoordinates.geometry.coordinates ?? [];

const Home = async () => {
  const softStoryData = await fetchSoftStories();
  const tsunamiData = await fetchTsunami();
  const liquefactionData = await fetchLiquefaction();

  return (
    <Flex direction="column">
      <HomeHeader />
      <Box w="base" h={{ base: "1400px", md: "1000px" }} m="auto">
        <Box h="100%" overflow="hidden" position="relative">
          <Box zIndex={10} top={0} position="absolute">
            <Report />
          </Box>
          <Map coordinates={coords} />
          <Box position="absolute" bottom={0}>
            <Information />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default Home;
