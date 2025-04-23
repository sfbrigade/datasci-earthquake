"use client";

import { Box, Text } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading from "./heading";
import { Headings } from "../data/data";

interface HomeHeaderProps {
  coordinates: number[];
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
  onCoordDataRetrieve: (data: any[]) => void;
  onHazardDataLoading: (isLoading: boolean) => void;
}

const HomeHeader = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
  onHazardDataLoading,
}: HomeHeaderProps) => {
  const headingData = Headings.home;

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
        <Heading headingData={headingData} />
        <Text textStyle="headerSmall" mb="30px" pr="300px">
          This project was built using data from DataSF.
        </Text>
        <SearchBar
          coordinates={coordinates}
          onSearchChange={onSearchChange}
          onAddressSearch={onAddressSearch}
          onCoordDataRetrieve={onCoordDataRetrieve}
          onHazardDataLoading={onHazardDataLoading}
        />
      </Box>
    </Box>
  );
};

export default HomeHeader;
