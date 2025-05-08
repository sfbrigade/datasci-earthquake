"use client";

import { Box, HStack, Link, Text, VStack, Image } from "@chakra-ui/react";
import { mockDisclaimers } from "./__mocks__/mock-data";
import NextLink from "next/link";

const Footer = () => {
  const buildDisclaimers = () => {
    return mockDisclaimers.map((disclaimer, index) => {
      return (
        <Text key={index} textStyle="textSmall" lineHeight={4} color="white">
          {disclaimer}
        </Text>
      );
    });
  };

  return (
    <Box as="footer" w="100%" bgColor="blueBackground">
      <HStack
        w={{ base: "full", xl: "7xl" }}
        p={{
          base: "8px 24px 8px 24px",
          md: "14px 28px 14px 28px",
          xl: "72px 128px 72px 128px",
        }}
        justify="space-between"
        alignItems="flex-start"
        m="auto"
      >
        <VStack alignItems="flex-start" maxW="672px" gap="24px">
          <Text textStyle="textSmall" color="white">
            © 2025 SF Civic Tech
          </Text>
          {buildDisclaimers()}
        </VStack>
        <VStack w="max-content" align="flex-end" gap="24px">
          <VStack gap="10px" align="flex-end">
            <Link as={NextLink} color="white" href="/about">
              <Text textStyle="textMedium" color="white">
                About
              </Text>
            </Link>
            <Link as={NextLink} color="white" href="/">
              <Text textStyle="textMedium" color="white">
                Contact
              </Text>
            </Link>
            <Link as={NextLink} color="white" href="/terms">
              <Text textStyle="textMedium" color="white">
                Terms of Service
              </Text>
            </Link>
          </VStack>
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
      </HStack>
    </Box>
  );
};

export default Footer;
