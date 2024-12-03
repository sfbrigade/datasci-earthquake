import { Box, Flex, Text } from "@chakra-ui/react";
import SearchBar from "./components/search-bar";
import Heading from "./components/heading";
import Map from "./components/map";
import "./globals.css";
import Report from "./components/report";

const Home = () => {
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
          <Heading />
          <SearchBar />
        </Box>
      </Box>
      <Box
        w={{ base: "base", xl: "xl" }}
        // w="base"
        p={{
          base: "23px 24px 16px 24px",
          md: "37px 27px 16px 26px",
          xl: "50px 128px 16px 127px",
        }}
        m="auto"
      >
        <Report />
      </Box>
      {/* <Box w="base" h={{ base: "323px", md: "411px", xl: "462px" }} m="auto"> */}
      <Box w="base" h={{ base: "646px", md: "822px", xl: "924px" }} m="auto">
        <Box
          h="100%"
          border="1px solid"
          borderColor="grey.400"
          overflow="hidden"
        >
          <Map />
        </Box>
      </Box>
      <Box bgColor="blue">
        <Box
          w="base"
          h={{ base: "166px", md: "213px", xl: "261px" }}
          m="auto"
        ></Box>
      </Box>
    </Flex>
  );
};

export default Home;
