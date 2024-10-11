import { Box, Flex } from "@chakra-ui/react";

const Home = () => {
  return (
    <Flex direction="column">
      <Box bgColor="primary.blue">
        <Box
          width={{ base: "base", lg: "lg" }}
          padding={{
            base: "45px 23px 50px 23px",
            md: "52px 27px 56px 26px",
            lg: "53px 127px 46px 127px",
          }}
          margin="auto"
        >
          Promo and search box
        </Box>
      </Box>
      <Box
        width={{ base: "base", lg: "lg" }}
        padding={{
          base: "23px 23px 27px 23px",
          md: "37px 27px 28px 26px",
          lg: "50px 127px 40px 127px",
        }}
        margin="auto"
      >
        Cards and map
      </Box>
      <Box bgColor="primary.blue">
        <Box
          width={{ base: "base", lg: "lg" }}
          padding={{
            base: "26px 23px 28px 23px",
            md: "37px 23px 28px 24px",
            lg: "24px 127px 22px 127px",
          }}
          margin="auto"
        >
          Cards
        </Box>
      </Box>
    </Flex>
  );
};

export default Home;
