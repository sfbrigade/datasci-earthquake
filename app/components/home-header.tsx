"use client";

import { Suspense, useState } from "react";
import ReactDOM from "react-dom";
// import { Headings } from "../data/data";
import {
  Box,
  Stack,
  Text,
  Highlight,
  HStack,
  Image,
  VisuallyHidden,
  Link,
  Flex,
  Heading as ChakraHeading
} from "@chakra-ui/react";
import { AnimatePresence, motion } from "framer-motion";
// import Heading from "./heading";
import ReportAddress from "./report-address";
import SearchBar from "./search-bar";
import SearchBarSkeleton from "./search-bar-skeleton";
import Share from "./share";
import ShareSkeleton from "./share-skeleton";
// import { ColorModeButton } from "../components/ui/color-mode";

export type HazardData = {
  liquefaction: { exists: boolean; last_updated: string | null } | null;
  softStory: { exists: boolean; last_updated: string | null } | null;
  tsunami: { exists: boolean; last_updated: string | null } | null;
};

interface HomeHeaderProps {
  coordinates: number[];
  searchedAddress: string;
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
  onCoordDataRetrieve: (data: HazardData) => void;
  onHazardDataLoading: (isLoading: boolean) => void;
}

const SEARCHBAR_PORTAL_ID = "searchbar-portal";

const HomeHeader = ({
  coordinates,
  searchedAddress,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
  onHazardDataLoading,
}: HomeHeaderProps) => {
  // const headingData = Headings.home;
  const [isSearchComplete, setSearchComplete] = useState(false);

  const headerContent = isSearchComplete ? (
    <motion.div
      key="results"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        alignItems={{ base: "flex-start", md: "flex-end" }}
        justifyContent="space-between"
      >
        <ReportAddress searchedAddress={searchedAddress} />
        {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
        <Suspense fallback={<ShareSkeleton />}>
          <Share />
        </Suspense>
      </Stack>
    </motion.div>
  ) : (
    <motion.div
      key="heading"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* <Heading headingData={headingData} /> */}
      <Flex
        direction={{
          base: "column",
          // sm: "column",
          md: "column",
          lg: "row-reverse",
          // xl: "row-reverse",
        }}
        justifyContent={"space-between"}
        gap={1.5}
        mb={5}
        // border={"1px solid yellow"}
      >
        <HStack align="start" gap="1">
          <Link
            as={"a"}
            color="white"
            href="/"
            textDecoration={"none"}
            onClick={(e) => {
              e.preventDefault();
              window.location.href = "/";
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
        <ChakraHeading size={"3xl"} color={"white"}>
          <Highlight query="How safe" styles={{ color: "yellow" }}>
            How safe is your home in an earthquake?
          </Highlight>
        </ChakraHeading>
      </Flex>
      {/* <Text
        textStyle="headerSmall"
        layerStyle="headerMain"
        mb="30px"
        pr={{ base: "10px", xl: "300px" }}
      >
        This project was built using data from DataSF.
      </Text> */}
    </motion.div>
  );

  const searchBarComponent = (
    <motion.div
      key="search"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
      <Suspense fallback={<SearchBarSkeleton />}>
        <SearchBar
          coordinates={coordinates}
          onSearchChange={onSearchChange}
          onAddressSearch={onAddressSearch}
          onCoordDataRetrieve={onCoordDataRetrieve}
          onHazardDataLoading={onHazardDataLoading}
          onSearchComplete={setSearchComplete}
        />
      </Suspense>
    </motion.div>
  );

  return (
    <Box
      bg="gradient.blue"
      // paddingTop={{ base: "56px", md: "72px", xl: "80px" }}
      p={{
        base: "30px 35px 20px 35px",
        // md: "44px 28px 44px 28px",
        xl: "40px 45px 30px 45px",
      }}
      // p={0}
      // margin="auto"
      // border={"1px solid red"}
    >
      {/* <Box
        w={{ base: "full", xl: "8xl" }}
        p={{
          base: "36px 24px 40px 24px",
          md: "44px 28px 44px 28px",
          xl: "24px 128px 24px 128px",
        }}
        margin="auto"
        border={"1px solid red"}
      > */}
      {/* <ColorModeButton /> */}
      <AnimatePresence mode="wait">{headerContent}</AnimatePresence>
      <AnimatePresence mode="wait">
        {!isSearchComplete && searchBarComponent}
      </AnimatePresence>
      {isSearchComplete &&
        typeof window !== "undefined" &&
        ReactDOM.createPortal(
          <AnimatePresence mode="wait">{searchBarComponent}</AnimatePresence>,
          document.getElementById(SEARCHBAR_PORTAL_ID) as HTMLElement
        )}
      {/* </Box> */}
    </Box>
  );
};

export default HomeHeader;
