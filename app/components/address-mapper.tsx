"use client";

import { useCallback, useEffect, useState } from "react";
import { Box } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";
import { useSearchParams } from "next/navigation";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";

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
  const searchParams = useSearchParams();
  const initialLat = searchParams.get("lat");
  const initialLon = searchParams.get("lon");
  const initialAddress = searchParams.get("address");

  // Initialize state directly from searchParams or fall back to null
  const [coordinates, setCoordinates] = useState<number[] | null>(
    initialLat && initialLon
      ? [parseFloat(initialLon), parseFloat(initialLat)]
      : null
  );
  const [searchedAddress, setSearchedAddress] = useState(initialAddress || "");
  const [addressHazardData, setAddressHazardData] = useState<object>({});
  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
  const [isSearchComplete, setSearchComplete] = useState(false);
  const toastIdDataLoadFailed = "data-load-failed";

  const { fetchHazardData } = useHazardDataFetcher({
    setSearchComplete,
    setHazardDataLoading,
  });

  const updateHazardData = useCallback(
    async (coords: number[]) => {
      try {
        const values = await fetchHazardData(coords);
        setAddressHazardData(values);
      } catch (error) {
        console.error(
          "Error while retrieving data: ",
          error instanceof Error ? error.message : error?.toString()
        );
        setAddressHazardData({
          softStory: null,
          tsunami: null,
          liquefaction: null,
        });
        toaster.create({
          description: "Could not retrieve hazard data",
          type: "error",
          duration: 5000,
          closable: true,
        });
      }
    },
    [fetchHazardData]
  );

  useEffect(() => {
    // This effect runs on mount and whenever searchParams change
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const address = searchParams.get("address");

    if (lat && lon && address) {
      const coords = [parseFloat(lon), parseFloat(lat)];
      // Update state to reflect the new URL
      setCoordinates(coords);
      setSearchedAddress(address);
      // Call the data fetch function
      updateHazardData(coords);
    }
  }, [searchParams, updateHazardData, setCoordinates, setSearchedAddress]);

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
        searchedAddress={searchedAddress}
        isSearchComplete={isSearchComplete}
        onSearchChange={setCoordinates}
        onAddressSearch={setSearchedAddress}
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
            coordinates={coordinates || defaultCoords}
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
