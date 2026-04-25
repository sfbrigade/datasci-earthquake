"use client";

import { useCallback, useEffect, useState } from "react";

import { Box, useMediaQuery } from "@chakra-ui/react";
import system from "../../styles/theme";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import MobileReportHazards from "./mobile-report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";

const defaultCoords = [-122.4194, 37.7949];
const toggledStatesDefaults = [true, true, true];
const mdBreakpointValue = system.token("breakpoints.md");

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
  // media query used for layout change
  const [md] = useMediaQuery([`(min-width: ${mdBreakpointValue})`]);

  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const initialLon = searchParams.get("lon");
  const initialLat = searchParams.get("lat");
  const initialAddress = searchParams.get("address");

  // TODO: actually validate params with eg Zod
  const validParams = !!(initialLon && initialLat && initialAddress);
  const [lon, lat] = validParams
    ? [parseFloat(initialLon), parseFloat(initialLat)]
    : defaultCoords;

  const [addressHazardData, setAddressHazardData] = useState<object>({});
  const displayData = validParams ? addressHazardData : {};

  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
  const [toggledStates, setToggledStates] = useState<boolean[]>(
    toggledStatesDefaults
  );
  const [layerToggleObj, setLayerToggleObj] = useState<LayerToggleObjProps>({
    layerId: "",
    toggleState: true,
  });
  const [showHazards, setShowHazards] = useState(false);
  const [isSearchComplete, setSearchComplete] = useState(false);
  const displaySearchComplete = validParams ? isSearchComplete : false;

  const toastIdDataLoadFailed = "data-load-failed";
  const coordinatesRef = useRef<number[] | null>(null);
  const router = useRouter();

  const { fetchHazardData } = useHazardDataFetcher({
    setSearchComplete,
    setHazardDataLoading,
  });

  // Get a new searchParams string by merging the current
  // searchParams with a provided key/value pair
  const createQueryString = useCallback(
    (paramsArray: string[][]) => {
      const params = new URLSearchParams(searchParams.toString());
      for (let param of paramsArray) {
        params.set(param[0], param[1]);
      }
      return params.toString();
    },
    [searchParams]
  );

  const handleSearchChange = useCallback(
    (coords: number[], address: string) => {
      const paramsArray = [
        ["address", address],
        ["lon", coords[0].toString()],
        ["lat", coords[1].toString()],
      ];

      const queryString = createQueryString(paramsArray);

      const newUrl = `${pathname}?${queryString}`;
      router.push(newUrl, { scroll: false });
    },
    [router, pathname, createQueryString]
  );

  useEffect(() => {
    let isCurrent = true;

    // NOTE: `updateHazardData` used to be outside the `useEffect`; it was moved inside the `useEffect` for two reasons:
    // 1. to prevent false positive from linter; as of this writing, the rule `react-hooks/set-state-in-effect`, which complains "Calling setState synchronously within an effect can trigger cascading renders" is buggy (see: https://github.com/facebook/react/issues/34905; it will erroneously flag an external function (outside of the `useEffect`) as using a synchronous state setter even if it's async, so the workaround is to move the function inside)
    // 2. to drop need for `useCallback()` around it to make it a stable reference (besides, it's currently only used in one place)
    const updateHazardData = async (coords: number[]) => {
      try {
        const values = await fetchHazardData(coords);
        if (isCurrent) {
          setAddressHazardData(values);
        }
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
    };

    if (!validParams) {
      return;
    } else {
      // TODO: check to see if we also need to verify that lon/lat actually changed
      updateHazardData([parseFloat(initialLon), parseFloat(initialLat)]);
    }

    return () => {
      // this cleanup prevents state updates on an unmounted component and also prevents updates if the user quickly changes search params before the async function can complete, which would cause a mismatch between the displayed data and the URL params
      isCurrent = false;
    };
  }, [validParams, initialLon, initialLat, fetchHazardData]);

  // TODO: check if this needs to be in a useEffect
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
      handleResize();
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentView]);

  return (
    <>
      <HomeHeader
        searchedAddress={initialAddress}
        isSearchComplete={displaySearchComplete}
        onSearchChange={handleSearchChange}
      />
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
        position={{ base: "relative", md: "static" }}
        alignItems={{ base: "stretch", md: "start" }}
        display={{ base: "block", md: "flex" }}
      >
        {!md ? (
          <Box zIndex="docked" top="0" position="absolute">
            <MobileReportHazards
              showHazards={showHazards}
              addressHazardData={displayData}
              isHazardDataLoading={isHazardDataLoading}
              toggledStates={toggledStates}
              setShowHazards={setShowHazards}
              setToggledStates={setToggledStates}
              setLayerToggleObj={setLayerToggleObj}
            />
          </Box>
        ) : (
          <Box h="full" overflowY={{ base: "visible", md: "auto" }}>
            <ReportHazards
              addressHazardData={displayData}
              isHazardDataLoading={isHazardDataLoading}
              toggledStates={toggledStates}
              setToggledStates={setToggledStates}
              setLayerToggleObj={setLayerToggleObj}
            />{" "}
          </Box>
        )}
        <Box
          flex={{ base: "initial", md: "1" }}
          h="full"
          w="full"
          bgColor="gray.100"
        >
          <Map
            lon={lon}
            lat={lat}
            address={initialAddress}
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
