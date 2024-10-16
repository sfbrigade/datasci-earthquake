import { Box, Flex, Text } from "@chakra-ui/react";

const Home = () => {
  return (
    <Flex direction="column">
      <Box bgColor="blue">
        <Box
          h={{ base: "166px", md: "213px", lg: "261px" }}
          w={{ base: "base", lg: "lg" }}
          p={{
            base: "45px 23px 50px 23px",
            md: "52px 27px 56px 26px",
            lg: "53px 127px 46px 127px",
          }}
          m="auto"
        >
          <Box h="100%" border="1px solid" borderColor="grey.400">
            <Text textStyle="headerBig">Promo and search box</Text>
          </Box>
        </Box>
      </Box>
      <Box
        w={{ base: "base", lg: "lg" }}
        h={{ base: "166px", md: "213px", lg: "261px" }}
        p={{
          base: "23px 23px 27px 23px",
          md: "37px 27px 28px 26px",
          lg: "50px 127px 40px 127px",
        }}
        m="auto"
      >
        <Box h="100%" border="1px solid" borderColor="grey.400">
          <Text textStyle="headerMedium">Cards and map box</Text>
        </Box>
      </Box>
      <Box bgColor="blue">
        <Box
          w={{ base: "base", lg: "lg" }}
          h={{ base: "166px", md: "213px", lg: "261px" }}
          p={{
            base: "26px 23px 28px 23px",
            md: "37px 23px 28px 24px",
            lg: "24px 127px 22px 127px",
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
