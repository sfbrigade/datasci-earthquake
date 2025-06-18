"use client";

import { Box, Stack, Text } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading from "./heading";
import { Headings } from "../data/data";
import { Suspense } from "react";
import ReactDOM from "react-dom";
import ReportAddress from "./report-address";
import Share from "./share";

interface HomeHeader2Props {
  coordinates: number[];
}

const SEARCHBAR_PORTAL_ID = "searchbar-portal";

const HomeHeader2 = ({ coordinates }: HomeHeader2Props) => {
  const headingData = Headings.home;

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
        <Heading headingData={headingData} />
        <Text
          textStyle="headerSmall"
          layerStyle="headerMain"
          mb="30px"
          pr={{ base: "10px", xl: "300px" }}
        >
          This project was built using data from DataSF.
        </Text>
        <Suspense>
          <SearchBar
            coordinates={coordinates}
            // onSearchChange={onSearchChange}
            // onAddressSearch={onAddressSearch}
            // onCoordDataRetrieve={onCoordDataRetrieve}
            // onHazardDataLoading={onHazardDataLoading}
            // onSearchComplete={setSearchComplete}
          />
        </Suspense>
      </Box>
    </Box>
  );
};

export default HomeHeader2;
