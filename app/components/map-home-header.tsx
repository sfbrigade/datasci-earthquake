"use client";

import { Suspense, useState } from "react";
import {
  Box,
  Flex,
  HStack,
  Image,
  Link,
  Text,
  VisuallyHidden,
} from "@chakra-ui/react";
import NextLink from "./custom-next-link";
import SearchBar from "./search-bar";
import Share from "./share";
import ShareSkeleton from "./share-skeleton";

interface MapHomeHeaderProps {
  searchedAddress: string | null;
  isSearchComplete: boolean;
  onSearchChange: (coords: number[], address: string) => void;
}

const MapHomeHeader = ({
  searchedAddress,
  isSearchComplete,
  onSearchChange,
}: MapHomeHeaderProps) => {
  const [inputAddress, setInputAddress] = useState("");

  return (
    <Box
      as="header"
      bg="blackBackgroundHeader"
      backdropFilter="blur(12px)"
      borderBottomWidth="0.25"
      borderBottomColor="whiteAlpha.200"
      px={{ base: "3", md: "4" }}
      py={{ base: "2", md: "2.5" }}
      minH={{ base: "20", md: "24" }}
    >
      <Flex
        direction={{ base: "column", lg: "row" }}
        align={{ base: "stretch", lg: "center" }}
        justify="space-between"
        gap={{ base: "2", lg: "3" }}
      >
        <HStack justify="space-between" gap="3" flexShrink={0}>
          <HStack gap="2" align="center">
            <Link as={NextLink} href="/" color="white" textDecoration="none">
              <HStack gap="2" align="baseline">
                <Image
                  src="/images/SFSafeHome-fulllogo.svg"
                  alt="SafeHome logo"
                  role="img"
                  height={{
                    base: "safeHomeLogoHeight",
                    md: "safeHomeLogoHeight",
                  }}
                  width="auto"
                />
                <VisuallyHidden>SafeHome</VisuallyHidden>
              </HStack>
            </Link>
            <Text color="whiteAlpha.700" fontSize="xs" fontWeight="semibold">
              Beta
            </Text>
          </HStack>

          <HStack gap="3" display={{ base: "none", md: "flex" }}>
            <Link
              as={NextLink}
              href="/about"
              color="whiteAlpha.900"
              fontSize="sm"
            >
              About
            </Link>
            <Link
              as={NextLink}
              href="/terms"
              color="whiteAlpha.900"
              fontSize="sm"
            >
              Terms
            </Link>
          </HStack>
        </HStack>

        <Flex
          direction={{ base: "column", lg: "row" }}
          align={{ base: "stretch", lg: "center" }}
          justify="space-between"
          gap={{ base: "2", lg: "3" }}
          flex="1"
        >
          <Box>
            <Text
              as="h1"
              color="white"
              fontSize={{ base: "sm", md: "md" }}
              fontWeight="semibold"
              lineHeight="shorter"
              mb={{ base: "2", lg: "0" }}
            >
              Check earthquake hazards for any San Francisco address
            </Text>
            {searchedAddress ? (
              <Text color="whiteAlpha.700" fontSize="xs" lineClamp="1">
                {searchedAddress}
              </Text>
            ) : null}
          </Box>

          <HStack
            align="center"
            gap="3"
            justify={{ base: "stretch", lg: "flex-end" }}
          >
            <Box flex="1" minW={{ base: "auto", lg: "7" }}>
              <SearchBar
                inputAddress={inputAddress}
                onInputAddressChange={setInputAddress}
                onSearchChange={onSearchChange}
              />
            </Box>
            {isSearchComplete ? (
              <Suspense fallback={<ShareSkeleton />}>
                <Share />
              </Suspense>
            ) : null}
          </HStack>
        </Flex>
      </Flex>
    </Box>
  );
};

export default MapHomeHeader;
