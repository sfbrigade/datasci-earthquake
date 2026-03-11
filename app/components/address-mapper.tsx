"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Box, chakra, useDisclosure } from "@chakra-ui/react";
import {
  Button,
  IconButton,
  CloseButton,
  Drawer,
  Kbd,
  Portal,
  Text,
} from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import MobileReportHazards from "./mobile-report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";
import { useSearchParams } from "next/navigation";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";

const addressLookupCoordinates = {
  geometry: { type: "Point", coordinates: [-122.408020683, 37.801698301] },
};
const defaultCoords = addressLookupCoordinates.geometry.coordinates ?? [];
const toggledStatesDefaults = [true, true, true];
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
  // Drawer
  const { open, onOpen, onClose } = useDisclosure();
  const drawerContainerRef = useRef(null);

  const searchParams = useSearchParams();
  const initialLat = searchParams.get("lat");
  const initialLon = searchParams.get("lon");
  const initialAddress = searchParams.get("address");

  // initialize state directly from searchParams or fall back to null
  const [coordinates, setCoordinates] = useState<number[] | null>(
    initialLat && initialLon
      ? [parseFloat(initialLon), parseFloat(initialLat)]
      : null
  );
  const [searchedAddress, setSearchedAddress] = useState(
    initialAddress || null
  );
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
  const [isSearchComplete, setSearchComplete] = useState(false);
  const [currentView, setCurrentView] = useState("");
  const toastIdDataLoadFailed = "data-load-failed";
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

  const handleResize = () => {
    setCurrentView(window.innerWidth <= 480 ? "mobile" : "desktop");
  };

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
        // FIXME: Avoid calling setState() directly within an effect (remove eslint directive below to see lint error)
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setCoordinates(newCoords);
        setSearchedAddress(address);
        coordinatesRef.current = newCoords;
        updateHazardData(newCoords);
      }
    } else if (coordinatesRef.current) {
      // clear state and coordinatesRef when navigating to a page without location params(ex. navigating back to main page after viewing a result)
      setCoordinates(null);
      setSearchedAddress(null);
      setAddressHazardData({});
      setSearchComplete(false);
      coordinatesRef.current = null;
    }
  }, [searchParams, updateHazardData]);

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
      <HomeHeader
        searchedAddress={searchedAddress}
        isSearchComplete={isSearchComplete}
        onSearchChange={handleSearchChange}
      />
      <Box
        w="full"
        m="auto"
        h="full"
        position="relative"
        ref={drawerContainerRef}
      >
        <Box h="full" overflow="hidden">
          <Box zIndex="docked" top="0" position="absolute">
            {currentView === "desktop" ? (
              <ReportHazards
                addressHazardData={addressHazardData}
                isHazardDataLoading={isHazardDataLoading}
                toggledStates={toggledStates}
                setToggledStates={setToggledStates}
                setLayerToggleObj={setLayerToggleObj}
              />
            ) : currentView === "mobile" ? (
              <MobileReportHazards
                showHazards={showHazards}
                addressHazardData={addressHazardData}
                isHazardDataLoading={isHazardDataLoading}
                toggledStates={toggledStates}
                setShowHazards={setShowHazards}
                setToggledStates={setToggledStates}
                setLayerToggleObj={setLayerToggleObj}
              />
            ) : null}
          </Box>
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
                    left={{ base: "calc(50% - {sizes.5})", md: "0" }}
                    bottom={{ base: "0", md: "calc(50% - {sizes.5})" }}
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
                    left={{
                      base: "calc(50% - {sizes.5})",
                      md: "calc({sizes.sm} - {sizes.5})",
                    }}
                    right={{
                      base: "calc(50% + {sizes.5})",
                      md: "calc({sizes.5} * -1)",
                    }}
                    top={{
                      base: "calc({sizes.5} * -1)",
                      md: "calc(50% - {sizes.5})",
                    }}
                  >
                    <IconButton variant="subtle" rounded="full" size="md">
                      <AngleLeft rotate={{ base: "270deg", md: "0deg" }} />
                    </IconButton>
                  </Drawer.CloseTrigger>
                  <Drawer.Header>
                    <Drawer.Title>Risk Layers</Drawer.Title>
                  </Drawer.Header>
                  <Drawer.Body>
                    Press the <Kbd>esc</Kbd> key to close the drawer.
                    <ReportHazards
                      addressHazardData={addressHazardData}
                      isHazardDataLoading={isHazardDataLoading}
                      toggledStates={toggledStates}
                      setToggledStates={setToggledStates}
                      setLayerToggleObj={setLayerToggleObj}
                      isInDrawer={true}
                    />
                  </Drawer.Body>
                  <Drawer.Footer>
                    {/* <Drawer.ActionTrigger asChild>
                      <Button variant="outline">Cancel</Button>
                    </Drawer.ActionTrigger>
                    <Button>Save</Button> */}
                  </Drawer.Footer>
                  <Drawer.CloseTrigger onClick={onOpen} asChild>
                    <CloseButton size="sm" />
                  </Drawer.CloseTrigger>
                </Drawer.Content>
              </Drawer.Positioner>
            </Portal>
          </Drawer.Root>
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
