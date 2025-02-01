import "./globals.css";
import { Box, Flex, Text } from "@chakra-ui/react";
import AddressMapper from "./components/address-mapper";
import Information from "./components/information";
import { Headings } from "./data/data";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";

const Home = async () => {
  const headingData = Headings.home;

  const softStoryData = await fetchSoftStories();
  const tsunamiData = await fetchTsunami();
  const liquefactionData = await fetchLiquefaction();
  console.log(softStoryData, tsunamiData, liquefactionData);

  return (
    <Flex direction="column">
      <AddressMapper
        headingData={headingData}
        softStoryData={softStoryData}
        tsunamiData={tsunamiData}
        liquefactionData={liquefactionData}
      />
      <Box bgColor="blue">
        <Box
          w={{ base: "base", xl: "xl" }}
          p={{
            base: "26px 23px 28px 23px",
            md: "37px 23px 28px 24px",
            xl: "24px 127px 22px 127px",
          }}
          m="auto"
        >
          <Information />
        </Box>
      </Box>
    </Flex>
  );
};

export default Home;
