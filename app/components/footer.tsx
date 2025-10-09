import { Box, Link, Text, VStack, Image, Stack } from "@chakra-ui/react";
import { mockDisclaimers } from "./__mocks__/mock-data";
import NextLink from "next/link";

const Footer = () => {
  const buildDisclaimers = () => {
    return mockDisclaimers.map((disclaimer, index) => {
      return (
        <Text
          key={index}
          textStyle="textXSmall"
          layerStyle="text"
          lineHeight="shorter"
          color="white"
        >
          {disclaimer}
        </Text>
      );
    });
  };

  return (
    <Box as="footer" w="100%" bgColor="blueBackground">
      <Stack
        w={{ base: "full" }}
        p={{
          base: "24px 48px 22px 48px",
          "2xl": "22px 48px 26px 48px",
        }}
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        alignItems="flex-start"
        m="auto"
        gap="36px"
      >
        <VStack
          alignItems="flex-start"
          maxW={{ base: "100%", lg: "672px" }}
          gap="24px"
        >
          <Text textStyle="textXSmall" layerStyle="text" color="white">
            © 2025 SF Civic Tech
          </Text>
          {buildDisclaimers()}
        </VStack>
        <VStack alignItems={{ base: "flex-start", lg: "flex-end" }} gap={8}>
          <Stack
            gap={4}
            align="flex-end"
            direction={{ base: "row", lg: "column" }}
            width="100%"
            mt={{ xl: 4 }}
          >
            <Link as={NextLink} color="white" href="/about">
              <Text textStyle="textMedium" layerStyle="text" color="white">
                About
              </Text>
            </Link>
            <Link color="white" href="mailto:sfcivictech.datascience@gmail.com">
              <Text textStyle="textMedium" layerStyle="text" color="white">
                Contact
              </Text>
            </Link>
            <Link as={NextLink} color="white" href="/terms">
              <Text textStyle="textMedium" layerStyle="text" color="white">
                Terms of Service
              </Text>
            </Link>
          </Stack>
          <Link
            as={NextLink}
            href="https://www.sfcivictech.org/"
            target="_blank"
          >
            <Image
              src="/images/SFCivicTech-logo.svg"
              alt="SF Civic Tech Logo"
            />
          </Link>
        </VStack>
      </Stack>
    </Box>
  );
};

export default Footer;
