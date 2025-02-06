"use client";

import { useState } from "react";
import { Box, Flex } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading, { HeadingProps } from "./heading";
import Map from "./map";
import Report from "./report";
import Information from "./information";

const addressLookupCoordinates = {
  geometry: {
    type: "Point",
    coordinates: [-122.408020683, 37.801698301],
  },
};
const defaultCoords = addressLookupCoordinates.geometry.coordinates ?? [];

interface AddressMapperProps {
  headingData: HeadingProps;
  softStoryData: {};
  tsunamiData: {};
  liquefactionData: {};
}

// TODO: pass data down to Map component
const AddressMapper: React.FC<AddressMapperProps> = ({
  headingData,
  softStoryData,
  tsunamiData,
  liquefactionData,
}) => {
  const [coordinates, setCoordinates] = useState(defaultCoords);

  const updateMap = (coords: number[]) => {
    setCoordinates(coords);
  };

  return (
    <Flex direction="column">
      <Box bgColor="blue">
        <Box
          w={{ base: "base", xl: "xl" }}
          p={{
            base: "45px 23px 50px 23px",
            md: "52px 260px 56px 26px",
            xl: "53px 470px 46px 127px",
          }}
          m="auto"
        >
          <Heading headingData={headingData} />
          <SearchBar coordinates={coordinates} onSearchChange={updateMap} />
        </Box>
      </Box>
      <Box w="base" h={{ base: "1400px", md: "1000px" }} m="auto">
        <Box
          h="100%"
          border="1px solid"
          borderColor="grey.400"
          overflow="hidden"
          position="relative"
        >
          <Box zIndex={10} top={0} position="absolute">
            <Report />
          </Box>
          <Map coordinates={coordinates} />
          <Box position="absolute" bottom={0}>
            <Information />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default AddressMapper;
