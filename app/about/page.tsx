import { Flex, Link, Text, Box, VStack, HStack } from "@chakra-ui/react";
import Heading from "../components/heading";
import { Headings } from "../data/data";
import NextLink from "next/link";
import Image from "next/image";

const About = () => {
  const headingData = Headings.about;
  return (
    <Flex
      w={{ base: "base", xl: "xl" }}
      p={{
        base: "23px 24px 16px 24px",
        md: "37px 27px 16px 26px",
        xl: "50px 128px 16px 127px",
      }}
      m="auto"
      gap="46px"
    >
      <Flex direction="column" alignItems={"flex-start"}>
        <Heading headingData={headingData} />
      </Flex>
      <Box w="fit-content">
        <Image
          src="/images/UserCartoon.png"
          alt="about us"
          width="302"
          height="280"
        />
      </Box>
    </Flex>
  );
};

export default About;
