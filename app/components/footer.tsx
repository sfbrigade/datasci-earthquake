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
    <Box as="footer" w="100%" bgColor="blue">
      <HStack
        w={{ base: "base", xl: "xl" }}
        p={{
          base: "8px 23px 8px 23px",
          md: "14px 26px 14px 26px",
          xl: "70px 131px 75px 131px",
        }}
        justify="space-between"
        m="auto"
      >
        <VStack alignItems="flex-start" maxW="672px" gap="24px">
          <Text textStyle="textSmall" color="white">
            © 2025 SF Civic Tech
          </Text>
          {buildDisclaimers()}
        </VStack>
        <VStack w="max-content" align="flex-end" gap="80px">
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
