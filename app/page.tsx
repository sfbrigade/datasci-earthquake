import { Box, Flex, Highlight, Text } from "@chakra-ui/react";
import SearchBar from "./components/search-bar";
import Heading from "./components/heading";

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
        h={{ base: "166px", md: "213px", xl: "261px" }}
        p={{
          base: "23px 23px 27px 23px",
          md: "37px 27px 28px 26px",
          xl: "50px 127px 40px 127px",
        }}
        m="auto"
      >
        <Box h="100%" border="1px solid" borderColor="grey.400">
          <Text textStyle="headerMedium">Cards and map box</Text>
        </Box>
      </Box>
      <Box bgColor="blue">
        <Box
          w={{ base: "base", xl: "xl" }}
          h={{ base: "166px", md: "213px", xl: "261px" }}
          p={{
            base: "26px 23px 28px 23px",
            md: "37px 23px 28px 24px",
            xl: "24px 127px 22px 127px",
          }}
          m="auto"
        >
          <Box h="100%" border="1px solid" borderColor="grey.400">
            <Text textStyle="headerSmall">Cards box</Text>
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default Home;
