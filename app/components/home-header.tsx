"use client";

import { Box, Stack, Text } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading from "./heading";
import { Headings } from "../data/data";
import { Suspense, useState } from "react";
import ReactDOM from "react-dom";
import ReportAddress from "./report-address";
import Share from "./share";

interface HomeHeaderProps {
  coordinates: number[];
  searchedAddress: string;
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
  onCoordDataRetrieve: (data: {
    softStory: any[] | null;
    tsunami: any[] | null;
    liquefaction: any[] | null;
  }) => void;
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
        {isSearchComplete && (
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
        )}
        {!isSearchComplete && (
          <>
            <Heading headingData={headingData} />
            <Text
              textStyle="headerSmall"
              layerStyle="headerMain"
              mb="30px"
              pr={{ base: "10px", xl: "300px" }}
            >
              This project was built using data from DataSF.
            </Text>
          </>
        )}
        <Suspense>
          {isSearchComplete && typeof window !== "undefined" ? (
            ReactDOM.createPortal(
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
          ) : (
            <SearchBar
              coordinates={coordinates}
              onSearchChange={onSearchChange}
              onAddressSearch={onAddressSearch}
              onCoordDataRetrieve={onCoordDataRetrieve}
              onHazardDataLoading={onHazardDataLoading}
              onSearchComplete={setSearchComplete}
            />
          )}
        </Suspense>
      </Box>
    </Box>
  );
};

export default HomeHeader;
