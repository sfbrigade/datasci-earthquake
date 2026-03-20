"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box } from "@chakra-ui/react";
import { useRouter, useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { toaster } from "@/components/ui/toaster";
import MapHomeHeader from "./map-home-header";
import HazardDrawer from "./hazard-drawer";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";

const Map = dynamic(() => import("./map"), {
  ssr: false,
  loading: () => <Box width="full" height="full" bg="gray.100" />,
});

const defaultCoords = [-122.408020683, 37.801698301];
const toggledStatesDefaults = [true, true, true];

export type LayerToggleObjProps = {
  layerId: string;
  toggleState: boolean;
};

const AddressMapper = () => {
  const searchParams = useSearchParams();
  const initialLat = searchParams.get("lat");
  const initialLon = searchParams.get("lon");
  const initialAddress = searchParams.get("address");

  const [coordinates, setCoordinates] = useState<number[] | null>(
    initialLat && initialLon
      ? [parseFloat(initialLon), parseFloat(initialLat)]
      : null
  );
  const [searchedAddress, setSearchedAddress] = useState(initialAddress || null);
  const [addressHazardData, setAddressHazardData] = useState<object>({});
  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
  const [toggledStates, setToggledStates] = useState<boolean[]>(
    toggledStatesDefaults
  );
  const [layerToggleObj, setLayerToggleObj] = useState<LayerToggleObjProps>({
    layerId: "",
    toggleState: true,
  });
  const [isSearchComplete, setSearchComplete] = useState(false);
  const coordinatesRef = useRef<number[] | null>(null);
  const router = useRouter();

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

  const handleSearchChange = useCallback(
    (coords: number[], address: string) => {
      const newUrl = `?address=${encodeURIComponent(address)}&lat=${coords[1]}&lon=${coords[0]}`;
      router.push(newUrl, { scroll: false });
    },
    [router]
  );

  useEffect(() => {
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");
    const address = searchParams.get("address");

    if (lat && lon && address) {
      const newCoords = [parseFloat(lon), parseFloat(lat)];
      const lastCoords = coordinatesRef.current;

      // only update state and fetch data if coordinates have changed
      if (
        !lastCoords ||
        lastCoords[0] !== newCoords[0] ||
        lastCoords[1] !== newCoords[1]
      ) {
        setCoordinates(newCoords);
        setSearchedAddress(address);
        coordinatesRef.current = newCoords;
        updateHazardData(newCoords);
      }
    } else if (coordinatesRef.current) {
      setCoordinates(null);
      setSearchedAddress(null);
      setAddressHazardData({});
      setSearchComplete(false);
      coordinatesRef.current = null;
    }
  }, [searchParams, updateHazardData]);

  return (
    <>
      <MapHomeHeader
        searchedAddress={searchedAddress}
        isSearchComplete={isSearchComplete}
        onSearchChange={handleSearchChange}
      />
      <Box
        width="full"
        css={{
          "--home-header-height": "76px",
          lg: { "--home-header-height": "84px" },
          "--home-footer-height": "44px",
          height:
            "calc(100dvh - var(--home-header-height) - var(--home-footer-height))",
        }}
        height="calc(100dvh - var(--home-header-height) - var(--home-footer-height))"
        position="relative"
        overflow="hidden"
        background="gray.100"
      >
        <HazardDrawer
          searchedAddress={searchedAddress}
          addressHazardData={addressHazardData}
          isHazardDataLoading={isHazardDataLoading}
          toggledStates={toggledStates}
          setToggledStates={setToggledStates}
          setLayerToggleObj={setLayerToggleObj}
        />
        <Box position="absolute" inset="0">
          <Map
            coordinates={coordinates || defaultCoords}
            layerToggleObj={layerToggleObj}
          />
        </Box>
      </Box>
    </>
  );
};

export default AddressMapper;
