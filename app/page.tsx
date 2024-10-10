import { Box, Flex } from "@chakra-ui/react";

const Home = () => {
  return (
    <Flex direction="column">
      <Box bgColor="primary.blue">
        <Box width={{ lg: "lg", md: "md", sm: "sm" }} margin="auto">
          Promo and search box
        </Box>
      </Box>
      <Box width={{ lg: "lg", md: "md", sm: "sm" }} margin="auto">
        Cards and map
      </Box>
      <Box bgColor="primary.blue">
        <Box width={{ lg: "lg", md: "md", sm: "sm" }} margin="auto">
          Cards
        </Box>
      </Box>
    </Flex>
  );
};

export default Home;
