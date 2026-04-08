"use client";

import { useCallback, useEffect, useState } from "react";

import { useSetAtom } from "jotai";
import {
  searchedAddressAtom,
  isSearchCompleteAtom,
} from "@/atoms/AddressSearchAtom";

import { Box } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import MobileReportHazards from "./mobile-report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";
import { useAddressFromSearchParams } from "@/hooks/useAddressFromSearchParams";

const addressLookupCoordinates = {
  geometry: { type: "Point", coordinates: [-122.408020683, 37.801698301] },
};
const defaultCoords = addressLookupCoordinates.geometry.coordinates ?? [];
const toggledStatesDefaults = [true, true, true];

interface AddressMapperProps {
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
}

export type LayerToggleObjProps = {
  layerId: string;
  toggleState: boolean;
};

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
  const { coordinates, coordinateKey, address } = useAddressFromSearchParams();
  console.log("ADDRESS", address);

  const setSearchedAddress = useSetAtom(searchedAddressAtom);
  const setIsSearchComplete = useSetAtom(isSearchCompleteAtom);

  const [addressHazardData, setAddressHazardData] = useState<object>({});
  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
  const [toggledStates, setToggledStates] = useState<boolean[]>(
    toggledStatesDefaults
  );
  const [layerToggleObj, setLayerToggleObj] = useState<LayerToggleObjProps>({
    layerId: "",
    toggleState: true,
  });
  const [showHazards, setShowHazards] = useState(false);
  const [currentView, setCurrentView] = useState("");
  const toastIdDataLoadFailed = "data-load-failed";

  const { fetchHazardData } = useHazardDataFetcher({
    setSearchComplete: setIsSearchComplete,
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

  const handleResize = () => {
    setCurrentView(window.innerWidth <= 480 ? "mobile" : "desktop");
  };

  useEffect(() => {
    if (!coordinates || !address) {
      setSearchedAddress(null);
      setIsSearchComplete(false);
      // FIXME: Avoid calling setState() directly within an effect (remove eslint directive below to see lint error)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setAddressHazardData({});
      return;
    }

    setSearchedAddress((prev) => prev ?? address);
    setIsSearchComplete(true);
    updateHazardData(coordinates);
  }, [coordinateKey, address, updateHazardData]);

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

  useEffect(() => {
    if (currentView === "") {
      // FIXME: Avoid calling setState() directly within an effect (remove eslint directive below to see lint error)
      // eslint-disable-next-line react-hooks/set-state-in-effect
      handleResize();
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentView]);

  return (
    <>
      {/* FIXME: the calculation no longer seems to work; double check and fix if necessary */}
      <Box
        w="full"
        css={{
          "--header-height": "198px",
          md: { "--header-height": "175px" },
          xl: { "--header-height": "141px" },
          "2xl": { "--header-height": "149px" },
          "--whitespace-height": "96px",
          "--map-height":
            "calc(100dvh - var(--header-height) - var(--whitespace-height))",
        }}
        h="var(--map-height)"
        m="auto"
        position={{ base: "relative", sm: "static" }}
        alignItems={{ base: "stretch", sm: "start" }}
        display={{ base: "block", sm: "flex" }}
      >
        {currentView === "desktop" ? (
          <Box h="full" overflowY={{ base: "visible", sm: "auto" }}>
            <ReportHazards
              addressHazardData={addressHazardData}
              isHazardDataLoading={isHazardDataLoading}
              toggledStates={toggledStates}
              setToggledStates={setToggledStates}
              setLayerToggleObj={setLayerToggleObj}
            />{" "}
          </Box>
        ) : currentView === "mobile" ? (
          <Box zIndex="docked" top="0" position="absolute">
            <MobileReportHazards
              showHazards={showHazards}
              addressHazardData={addressHazardData}
              isHazardDataLoading={isHazardDataLoading}
              toggledStates={toggledStates}
              setShowHazards={setShowHazards}
              setToggledStates={setToggledStates}
              setLayerToggleObj={setLayerToggleObj}
            />
          </Box>
        ) : null}

        <Box flex={{ base: "initial", sm: "1" }} h="full">
          <Map
            coordinates={coordinates || defaultCoords}
            softStoryData={softStoryData}
            tsunamiData={tsunamiData}
            liquefactionData={liquefactionData}
            layerToggleObj={layerToggleObj}
          />
        </Box>
      </Box>
    </>
  );
};

export default AddressMapper;
