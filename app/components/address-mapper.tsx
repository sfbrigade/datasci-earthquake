"use client";

import { useEffect, useState } from "react";
import { Box, Flex, useToast } from "@chakra-ui/react";
import SearchBar from "./search-bar";
import Heading, { HeadingProps } from "./heading";
import Map from "./map";
import Report from "./report-hazards";
import Information from "./information";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";

const addressLookupCoordinates = {
  geometry: {
    type: "Point",
    coordinates: [-122.408020683, 37.801698301],
  },
};
const defaultCoords = addressLookupCoordinates.geometry.coordinates ?? [];

interface AddressMapperProps {
  headingData: HeadingProps;
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
}

type ErrorResult = { error: true; message: string };

const isErrorResult = (data: unknown): data is ErrorResult => {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    (data as any).error === true
  );
};

const AddressMapper: React.FC<AddressMapperProps> = ({
  headingData,
  softStoryData,
  tsunamiData,
  liquefactionData,
}) => {
  const [coordinates, setCoordinates] = useState(defaultCoords);
  const [searchedAddress, setSearchedAddress] = useState("");
  const [addressHazardData, setAddressHazardData] = useState<object>({});
  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
  const toast = useToast();
  const toastIdDataLoadFailed = "data-load-failed";

  const updateMap = (coords: number[]) => {
    setCoordinates(coords);
  };

  useEffect(() => {
    const sources = [
      { name: "Soft Story Buildings", data: softStoryData },
      { name: "Tsunami Zones", data: tsunamiData },
      { name: "Liquefaction Zones", data: liquefactionData },
    ];

    const errors = sources
      .filter((src) => isErrorResult(src.data))
      .map(
        (src) =>
          `${src.name}: ${(src.data as unknown as ErrorResult).message || "Unknown error"}`
      );

    if (errors.length > 0) {
      if (!toast.isActive(toastIdDataLoadFailed)) {
        toast({
          id: "data-load-failed",
          title: "Data Load Error",
          description: errors.join(" | "),
          status: "error",
          duration: 5000,
          isClosable: true,
          position: "top",
          containerStyle: {
            backgroundColor: "#b53d37",
            borderRadius: "12px",
          },
        });
      }
    }
  }, [softStoryData, tsunamiData, liquefactionData, toast]);

  return (
    <Flex direction="column">
      <HomeHeader
        coordinates={coordinates}
        searchedAddress={searchedAddress}
        onSearchChange={updateMap}
        onAddressSearch={setSearchedAddress}
        onCoordDataRetrieve={setAddressHazardData}
        onHazardDataLoading={setHazardDataLoading}
      />
      <Box w="base" h={{ base: "1400px", md: "1000px" }} m="auto">
        <Box h="100%" overflow="hidden" position="relative">
          <Box zIndex={10} top={0} position="absolute">
            <Report
              searchedAddress={searchedAddress}
              addressHazardData={addressHazardData}
              isHazardDataLoading={isHazardDataLoading}
            />
          </Box>
          <Map
            coordinates={coordinates}
            softStoryData={softStoryData}
            tsunamiData={tsunamiData}
            liquefactionData={liquefactionData}
          />
          <Box position="absolute" bottom={0}>
            <Information />
          </Box>
        </Box>
      </Box>
    </Flex>
  );
};

export default AddressMapper;
