import { Box, Link, Text, VStack, Image, Stack } from "@chakra-ui/react";
import { mockDisclaimers } from "./__mocks__/mock-data";
import NextLink from "./custom-next-link";

const Footer = () => {
  const disclaimers = mockDisclaimers.map((disclaimer, index) => {
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

  return (
    <Box as="footer" w="full" bgColor="blueBackground">
      <Stack
        w={{ base: "full" }}
        py="6"
        px="8"
        direction={{ base: "column", lg: "row" }}
        justify="space-between"
        alignItems="flex-start"
        m="auto"
        gap="9"
      >
        <VStack
          alignItems="flex-start"
          maxW={{ base: "full", lg: "2xl" }}
          gap="6"
        >
          <Text textStyle="textXSmall" layerStyle="text" color="white">
            © 2025 SF Civic Tech
          </Text>
          {disclaimers}
        </VStack>
        <VStack alignItems={{ base: "flex-start", lg: "flex-end" }} gap="8">
          <Stack
            gap="4"
            align="flex-end"
            direction={{ base: "row", lg: "column" }}
            width="full"
            mt={{ xl: "4" }}
          >
            <Link as={NextLink} color="white" href="/earthquake-introduction">
              <Text textStyle="textMedium" layerStyle="text" color="white">
                Earthquake Introduction
              </Text>
            </Link>
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
              role="img" // needed for VoiceOver bug for SVGs: https://bugs.webkit.org/show_bug.cgi?id=216364
              height="sfctLogoHeight"
              width="sfctLogoWidth"
            />
          </Link>
        </VStack>
      </Stack>
    </Box>
  );
};

export default Footer;
