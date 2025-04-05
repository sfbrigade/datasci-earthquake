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
}

const HomeHeader = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
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
          md: "42px 26px 46px 26px",
          xl: "43px 130px 46px 130px",
        }}
        margin="auto"
      >
        <Heading headingData={headingData} />
        <Text textStyle="headerSmall" mb="30px" pr="300px">
          Supporting the City of San Francisco’s initiative to increase the
          earthquake safety of its multifamily residences.
        </Text>
        <SearchBar
          coordinates={coordinates}
          onSearchChange={onSearchChange}
          onAddressSearch={onAddressSearch}
          onCoordDataRetrieve={onCoordDataRetrieve}
        />
      </Box>
    </Box>
  );
};

export default HomeHeader;
