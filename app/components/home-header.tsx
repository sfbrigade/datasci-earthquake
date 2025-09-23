"use client";

import { Suspense } from "react";
import { useRouter } from "next/navigation";
import { Headings } from "../data/data";
import {
  Box,
  Text,
  HStack,
  Image,
  VisuallyHidden,
  Link,
  Flex,
} from "@chakra-ui/react";
import Heading from "./heading";
import ReportAddress from "./report-address";
import SearchBar from "./search-bar";
import Share from "./share";
import ShareSkeleton from "./share-skeleton";

export type HazardData = {
  liquefaction: { exists: boolean; last_updated: string | null } | null;
  softStory: { exists: boolean; last_updated: string | null } | null;
  tsunami: { exists: boolean; last_updated: string | null } | null;
};

interface HomeHeaderProps {
  searchedAddress: string | null;
  isSearchComplete: boolean;
  onSearchChange: (coords: number[], address: string) => void;
}

const HomeHeader = ({
  searchedAddress,
  isSearchComplete,
  onSearchChange,
}: HomeHeaderProps) => {
  const headingData = Headings.home;
  const router = useRouter();

  return (
    <Box
      as="header"
      bg="gradient.blue"
      p={{
        base: "18px 32px 22px 48px",
        "2xl": "22px 48px 26px 48px",
      }}
    >
      <Flex
        direction={{
          base: "column",
          md: "column",
          lg: "row-reverse",
        }}
        justifyContent={"space-between"}
        alignItems={{ base: "flex-start", xl: "center" }}
        gap={1.5}
        mb={{ base: 2 }}
      >
        <HStack align="start" gap="1">
          <Link
            as={"a"}
            color="white"
            href="/"
            cursor="pointer"
            textDecoration={"none"}
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
            }}
          >
            <HStack align="baseline">
              <Image
                src="/images/SFSafeHome-fulllogo.svg"
                alt="SafeHome logo"
                role="img" // needed for VoiceOver bug: https://bugs.webkit.org/show_bug.cgi?id=216364
                h="28px"
                w="142px"
              />
              <VisuallyHidden>SafeHome</VisuallyHidden>
            </HStack>{" "}
          </Link>
          <Text textStyle="textPrerelease" layerStyle="prerelease">
            Beta
          </Text>
        </HStack>
        {isSearchComplete ? (
          <ReportAddress searchedAddress={searchedAddress} />
        ) : (
          <Heading headingData={headingData} />
        )}
      </Flex>

      <Flex
        direction={{ base: "column-reverse", xl: "row" }}
        justifyContent={"space-between"}
        alignItems={{ base: "flex-start", xl: "center" }}
      >
        <Box width={{ base: "100%", xl: "fit-content" }}>
          <SearchBar onSearchChange={onSearchChange} />
        </Box>

        {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
        {isSearchComplete ? (
          <Suspense fallback={<ShareSkeleton />}>
            <Share />
          </Suspense>
        ) : null}
      </Flex>
    </Box>
  );
};

export default HomeHeader;
