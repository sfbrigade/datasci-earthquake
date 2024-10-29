import { Highlight, Text } from "@chakra-ui/react";

const Heading = () => {
  return (
    <Text
      textStyle="headerBig"
      mb="43px"
      maxW={{ base: "332px", md: "457px", xl: "546px" }}
    >
      <Highlight query="Learn about" styles={{ color: "yellow" }}>
        Learn about your home’s earthquake readiness.
      </Highlight>
    </Text>
  );
};

export default Heading;
