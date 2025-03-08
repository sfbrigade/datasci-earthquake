"use client";

import { Box, Text } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading from "./heading";
import { Headings } from "../data/data";

interface HomeHeaderProps {
  coordinates: number[];
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
}

const HomeHeader = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
}: HomeHeaderProps) => {
  const headingData = Headings.home;

  return (
    <Box
      bg="gradient.blue"
      paddingTop={{ base: "57px", md: "76px", xl: "78px" }}
    >
      <Box
        w={{ base: "100%", md: "65%" }}
        p={{
          base: "35px 23px 40px 23px",
          md: "42px 0px 46px 26px",
          xl: "43px 0px 46px 127px",
        }}
      >
        <Heading headingData={headingData} />
        <Text textStyle="headerSmall" mb="30px">
          Supporting the City of San Francisco’s initiative to increase the
          earthquake safety of its multifamily residences.
        </Text>
        <SearchBar
          coordinates={coordinates}
          onSearchChange={onSearchChange}
          onAddressSearch={onAddressSearch}
        />
      </Box>
    </Box>
  );
};

export default HomeHeader;
