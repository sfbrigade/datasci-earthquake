import { Box, Flex, Text } from "@chakra-ui/react";
import SearchBar from "./components/search-bar";
import Heading from "./components/heading";
import Map from "./components/map";
import "./globals.css";
import Report from "./components/report";
import Information from "./components/information";
import { Headings } from "./data/data";
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
  const headingData = Headings.home;

  const softStoryData = await fetchSoftStories();
  const tsunamiData = await fetchTsunami();
  const liquefactionData = await fetchLiquefaction();

  return (
    <Flex direction="column">
      <Box bg="gradient.blue">
        <Box
          w={{ base: "100%", md: "65%" }}
          p={{
            base: "45px 23px 50px 23px",
            md: "52px 0px 56px 26px",
            xl: "53px 0px 46px 127px",
          }}
        >
          <Heading headingData={headingData} />
          <Text textStyle="headerSmall" mb="30px">
            Supporting the City of San Francisco’s initiative to increase the
            earthquake safety of its multifamily residences.
          </Text>
          <SearchBar />
        </Box>
      </Box>
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
