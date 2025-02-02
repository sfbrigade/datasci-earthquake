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
      <Box bgColor="blue">
        <Box
          w={{ base: "base", xl: "xl" }}
          p={{
            base: "45px 23px 50px 23px",
            md: "52px 260px 56px 26px",
            xl: "53px 470px 46px 127px",
          }}
          m="auto"
        >
          <Heading headingData={headingData} />
          <SearchBar />
        </Box>
      </Box>
      <Box w="base" h={{ base: "1200px", md: "1000px", xl: "950px" }} m="auto">
        <Box
          h="100%"
          border="1px solid"
          borderColor="grey.400"
          overflow="hidden"
          position="relative"
        >
          <Box w="100%" zIndex={10} p={0} m="auto" top={0} position="absolute">
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
