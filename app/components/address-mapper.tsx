"use client";

import { useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";

const addressLookupCoordinates = {
  geometry: { type: "Point", coordinates: [-122.408020683, 37.801698301] },
};
const defaultCoords = addressLookupCoordinates.geometry.coordinates ?? [];

interface AddressMapperProps {
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
  softStoryData,
  tsunamiData,
  liquefactionData,
}) => {
  const [coordinates, setCoordinates] = useState(defaultCoords);
  const [searchedAddress, setSearchedAddress] = useState("");
  const [addressHazardData, setAddressHazardData] = useState<object>({});
  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
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
      if (!toaster.isVisible(toastIdDataLoadFailed)) {
        toaster.create({
          id: toastIdDataLoadFailed,
          title: "Data Load Error",
          description: errors.join(" | "),
          type: "error",
          duration: 5000,
          closable: true,
        });
      }
    }
  }, [softStoryData, tsunamiData, liquefactionData]);

  return (
    <>
      <HomeHeader
        coordinates={coordinates}
        searchedAddress={searchedAddress}
        onSearchChange={updateMap}
        onAddressSearch={setSearchedAddress}
        onCoordDataRetrieve={setAddressHazardData}
        onHazardDataLoading={setHazardDataLoading}
      />
      <Box w="full" h={{ base: "1400px", md: "1000px" }} m="auto">
        <Box h="100%" overflow="hidden" position="relative">
          <Box zIndex={10} top={0} position="absolute">
            <ReportHazards
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
        </Box>
      </Box>
    </>
  );
};

export default AddressMapper;
