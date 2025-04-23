"use client";

import { Box, Stack, Text } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading from "./heading";
import { Headings } from "../data/data";
import { useState } from "react";
import ReactDOM from "react-dom";
import ReportAddress from "./report-address";
import Share from "./share";

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

  return (
    <Box
      bg="gradient.blue"
      paddingTop={{ base: "57px", md: "76px", xl: "78px" }}
    >
      <Box
        w={{ base: "base", xl: "xl" }}
        p={{
          base: "35px 23px 40px 23px",
          md: "42px 0px 46px 26px",
          xl: "43px 0px 58px 127px",
        }}
        margin="auto"
      >
        {isSearchComplete && (
          <Stack
            w={{ base: "base", xl: "xl" }}
            px={{
              base: "23px",
              md: "26px",
              xl: "127px",
            }}
            direction={{ base: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
          >
            <ReportAddress searchedAddress={searchedAddress} />
            <Share />
          </Stack>
          )
        }
        {!isSearchComplete && <>
            <Heading headingData={headingData} />
            <Text textStyle="headerSmall" mb="30px" pr="300px">
              This project was built using data from DataSF.
            </Text>
        </>}
        {isSearchComplete && typeof window !== "undefined"
          ? ReactDOM.createPortal(
            <SearchBar
              coordinates={coordinates}
              onSearchChange={onSearchChange}
              onAddressSearch={onAddressSearch}
              onCoordDataRetrieve={onCoordDataRetrieve}
              onHazardDataLoading={onHazardDataLoading}
              onSearchComplete={setSearchComplete}
            />,
            document.getElementById(SEARCHBAR_PORTAL_ID) as HTMLElement
          )
          : (
            <SearchBar
            coordinates={coordinates}
            onSearchChange={onSearchChange}
            onAddressSearch={onAddressSearch}
            onCoordDataRetrieve={onCoordDataRetrieve}
            onHazardDataLoading={onHazardDataLoading}
            onSearchComplete={setSearchComplete}
          />
          )
        }
      </Box>
    </Box>
  );
};

export default HomeHeader;
