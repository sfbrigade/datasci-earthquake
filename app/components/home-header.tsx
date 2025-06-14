"use client";

import { Suspense, useState } from "react";
import ReactDOM from "react-dom";
import { Headings } from "../data/data";
import { Box, Stack, Text } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading from "./heading";
import ReportAddress from "./report-address";
import Share from "./share";
import { AnimatePresence, motion } from "framer-motion";

interface HomeHeaderProps {
  coordinates: number[];
  searchedAddress: string;
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
  onCoordDataRetrieve: (data: any[]) => void;
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
  const headingData = Headings.home;
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
        <Suspense>
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
      <Heading headingData={headingData} />
      <Text
        textStyle="headerSmall"
        mb="30px"
        pr={{ base: "10px", xl: "300px" }}
      >
        This project was built using data from DataSF.
      </Text>
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
      <Suspense>
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
      paddingTop={{ base: "56px", md: "72px", xl: "80px" }}
    >
      <Box
        w={{ base: "full", xl: "7xl" }}
        p={{
          base: "36px 24px 40px 24px",
          md: "44px 28px 44px 28px",
          xl: "24px 128px 24px 128px",
        }}
        margin="auto"
      >
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
      </Box>
    </Box>
  );
};

export default HomeHeader;
