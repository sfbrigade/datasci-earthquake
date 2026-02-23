"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  chakra,
  useDisclosure,
  Heading,
  IconButton,
  Drawer,
  Portal,
  Box,
  Text,
  Center,
  Stack,
  useMediaQuery,
} from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";
import system from "../../styles/theme";
import SearchBar from "./search-bar";
import { CurrentVariant } from "@/data/constants";
import EarthquakeReadyCards from "./earthquake-ready-cards";

const defaultCoords = [-122.4194, 37.7949];
const toggledStatesDefaults = [true, true, true];
const mdBreakpointValue = system.token("breakpoints.md");
const AngleLeft = chakra(FaAngleLeft);
const AngleRight = chakra(FaAngleRight);

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
  // Drawer
  const { open, onOpen, onClose } = useDisclosure();
  const drawerContainerRef = useRef(null);

  const searchParams = useSearchParams();
  const initialLon = searchParams.get("lon");
  const initialLat = searchParams.get("lat");
  const initialAddress = searchParams.get("address");
  const [inputAddress, setInputAddress] = useState(initialAddress || "");

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
  const [isSearchComplete, setSearchComplete] = useState(false);
  const displaySearchComplete = validParams ? isSearchComplete : false;

  const toastIdDataLoadFailed = "data-load-failed";

  const [showHazards, setShowHazards] = useState(false);

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

  const resetInputAddress = useCallback(() => {
    setInputAddress("");
  }, []);

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

  return (
    <>
      <HomeHeader
        searchedAddress={initialAddress}
        isSearchComplete={displaySearchComplete}
        onHomeIconClick={resetInputAddress}
      >
        {CurrentVariant === "map-centric" && (
          <SearchBar
            inputAddress={inputAddress}
            onInputAddressChange={setInputAddress}
            onSearchChange={handleSearchChange}
          />
        )}
      </HomeHeader>
      <Box
        w="full"
        h={CurrentVariant === "data-centric" ? "80" : "full"}
        m="auto"
        position="relative"
        ref={drawerContainerRef}
      >
        <Box h="full" overflow="hidden">
          {CurrentVariant === "map-centric" && (
            <Drawer.Root
              placement={{ mdDown: "bottom", md: "start" }}
              open={open}
            >
              <Portal container={drawerContainerRef}>
                {/* dummy drawer, closed */}
                {open ? null : (
                  <Box
                    position="absolute"
                    zIndex="overlay"
                    top={{ base: "auto", md: "0" }}
                    left="0"
                    bottom="0"
                    right={{ base: "0", md: "auto" }}
                    w={{ base: "auto", md: "5" }}
                    h={{ base: "5", md: "auto" }}
                    backgroundColor="white"
                  >
                    <Drawer.Trigger
                      onClick={onOpen}
                      asChild
                      position="absolute"
                      // Mobile: center horizontally at bottom.
                      left={{ base: "0", md: "0" }}
                      right={{ base: "0", md: "auto" }}
                      bottom={{ base: "0", md: "auto" }}
                      // Desktop: vertically center relative to container.
                      top={{ base: "auto", md: "1/2" }}
                      w={{ base: "fit", md: "auto" }}
                      mx={{ base: "auto", md: "0" }}
                      transform={{ base: "none", md: "translateY(-50%)" }}
                    >
                      <IconButton variant="subtle" rounded="full" size="md">
                        <AngleRight rotate={{ base: "270deg", md: "0deg" }} />
                      </IconButton>
                    </Drawer.Trigger>
                  </Box>
                )}
                <Drawer.Backdrop h="full" w="full" position="absolute" />
                <Drawer.Positioner h="full" w="full" position="absolute">
                  {/* actual drawer, open */}
                  <Drawer.Content
                    // NOTE: the following props are used because the `size` prop values of `Drawer.Root` are too limited (and do not directly correspond to the theme `sizes` tokens)
                    w={{ base: "full", md: "sm" }}
                    maxW={{ base: "full", md: "sm" }}
                    h={{ base: "1/2", md: "full" }}
                    maxH={{ base: "1/2", md: "full" }}
                  >
                    <Drawer.CloseTrigger
                      onClick={onClose}
                      asChild
                      position="absolute"
                      // Mobile: centered above drawer edge.
                      // Desktop: right edge, vertically centered.
                      left={{ base: "0", md: "auto" }}
                      right={{ base: "0", md: "-5" }}
                      top={{ base: "-5", md: "1/2" }}
                      w={{ base: "fit", md: "auto" }}
                      mx={{ base: "auto", md: "0" }}
                      transform={{ base: "none", md: "translateY(-50%)" }}
                    >
                      <IconButton variant="subtle" rounded="full" size="md">
                        <AngleLeft rotate={{ base: "270deg", md: "0deg" }} />
                      </IconButton>
                    </Drawer.CloseTrigger>
                    <Drawer.Header>
                      <Drawer.Title>Risk Layers</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <ReportHazards
                        addressHazardData={displayData}
                        isHazardDataLoading={isHazardDataLoading}
                        toggledStates={toggledStates}
                        setToggledStates={setToggledStates}
                        setLayerToggleObj={setLayerToggleObj}
                        isInDrawer={true}
                      />
                    </Drawer.Body>
                    <Drawer.Footer></Drawer.Footer>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          )}
          {CurrentVariant === "data-centric" && (
            <Box zIndex="docked" top="16" left="8" position="absolute">
              <SearchBar
                inputAddress={inputAddress}
                onInputAddressChange={setInputAddress}
                onSearchChange={handleSearchChange}
              />
            </Box>
          )}
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
      {CurrentVariant === "data-centric" && (
        <>
          <Box pt="8" pb="4" px="8">
            <Heading as="h2">
              <Text
                as="span"
                textStyle="headerBig"
                layerStyle="headerMain"
                color="blue.text"
                fontWeight="light"
              >
                What your risks mean
              </Text>
            </Heading>
          </Box>
          <Center py="4" px="8">
            <ReportHazards
              addressHazardData={addressHazardData}
              isHazardDataLoading={isHazardDataLoading}
              toggledStates={toggledStates}
              setToggledStates={setToggledStates}
              setLayerToggleObj={setLayerToggleObj}
              stackDirectionResponsive={true}
            />
          </Center>
          <Box pt="8" pb="4" px="8">
            <Heading as="h2">
              <Stack gap="3">
                <Text
                  as="span"
                  textStyle="headerBig"
                  layerStyle="headerMain"
                  color="blue.text"
                  fontWeight="light"
                >
                  Get earthquake-ready
                </Text>
                <Text textStyle="xs">
                  Quick steps that make a real difference when it counts.
                </Text>
              </Stack>
            </Heading>
          </Box>
          <EarthquakeReadyCards></EarthquakeReadyCards>
        </>
      )}
    </>
  );
};

export default AddressMapper;
