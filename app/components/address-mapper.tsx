"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import {
  chakra,
  Image,
  useDisclosure,
  Heading,
  IconButton,
  Drawer,
  Portal,
  Box,
  Text,
  Center,
  Stack,
  Card,
  Flex,
  useBreakpointValue,
} from "@chakra-ui/react";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";
import SearchBar from "./search-bar";
import { CurrentVariant } from "@/data/constants";
import EarthquakeReadyCards from "./earthquake-ready-cards";
import AlertInfo from "@/components/ui/alert-info";

const defaultCoords = [-122.4194, 37.7949];

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
  const router = useRouter();
  const pathname = usePathname();

  // Responsive check for mobile only
  const isMobile = useBreakpointValue(
    { base: true, md: false },
    { fallback: "base" }
  );

  // Drawer
  const { open, onOpen, onClose } = useDisclosure();
  const drawerContainerRef = useRef(null);

  // Search Box
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
        h={
          CurrentVariant === "data-centric"
            ? { base: "full", md: "80" }
            : "full"
        }
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
          {CurrentVariant === "data-centric" && isMobile ? (
            <Drawer.Root placement="bottom" open={open}>
              <Portal container={drawerContainerRef}>
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
                        <AngleRight rotate="270deg" />
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
                      left="0"
                      right="0"
                      top="-5"
                      w="fit"
                      mx="auto"
                    >
                      <IconButton variant="subtle" rounded="full" size="md">
                        <AngleLeft rotate="270deg" />
                      </IconButton>
                    </Drawer.CloseTrigger>
                    <Drawer.Header>
                      <Drawer.Title>Risk Layers</Drawer.Title>
                    </Drawer.Header>
                    <Drawer.Body>
                      <ReportHazards
                        variant="cardhazardsummary"
                        addressHazardData={addressHazardData}
                        isHazardDataLoading={isHazardDataLoading}
                        toggledStates={toggledStates}
                        setToggledStates={setToggledStates}
                        setLayerToggleObj={setLayerToggleObj}
                      />
                      <Box bgColor="peach">
                        <Box pt="8" pb="4" px="8">
                          <Heading as="h2" pb="4">
                            <Text
                              as="span"
                              textStyle="headerBig"
                              layerStyle="headerMain"
                              color="black"
                              fontWeight="light"
                            >
                              What your risks mean
                            </Text>
                          </Heading>

                          <Center>
                            <ReportHazards
                              variant="reporthazardsummary"
                              addressHazardData={addressHazardData}
                              isHazardDataLoading={isHazardDataLoading}
                              toggledStates={toggledStates}
                              setToggledStates={setToggledStates}
                              setLayerToggleObj={setLayerToggleObj}
                            />
                          </Center>
                        </Box>
                        <Box pt="8" pb="4" px="8">
                          <Heading as="h2">
                            <Stack gap="3">
                              <Text
                                as="span"
                                textStyle="headerBig"
                                layerStyle="headerMain"
                                color="black"
                                fontWeight="light"
                              >
                                Get earthquake-ready
                              </Text>
                              <Text textStyle="xs">
                                Quick steps that make a real difference when it
                                counts.
                              </Text>
                            </Stack>
                          </Heading>
                        </Box>
                        <EarthquakeReadyCards></EarthquakeReadyCards>
                        <Center py="4" px="8">
                          <Flex
                            bg="blue.50"
                            p="4"
                            borderRadius="md"
                            mt="4"
                            gap="6"
                          >
                            <div>
                              <Image
                                src="/images/SFCivicTech-Rights.svg"
                                alt="SafeHome logo"
                                role="img" // needed for VoiceOver bug: https://bugs.webkit.org/show_bug.cgi?id=216364
                                height="auto"
                                width="auto"
                                display="inline"
                              />
                            </div>
                            <div>
                              <Text fontSize="lg" fontWeight="bold" mb="3">
                                Renting? Know your rights.
                              </Text>
                              <Text>
                                If you live in a non-compliant building or
                                high-risk zone, you have options. Get earthquake
                                renters insurance to protect your belongings,
                                or learn about your right to report unsafe
                                living conditions to the city.
                              </Text>
                            </div>
                          </Flex>
                        </Center>
                      </Box>
                    </Drawer.Body>
                    <Drawer.Footer></Drawer.Footer>
                  </Drawer.Content>
                </Drawer.Positioner>
              </Portal>
            </Drawer.Root>
          ) : (
            <>
              <Box zIndex="docked" top="36" left="8" position="absolute">
                <Card.Root>
                  <Card.Header>
                    <Card.Title mt="2">
                      <Flex gap="4" align="center">
                        <div>
                          <Image
                            src="/images/SFSafehomeBlackLogo.svg"
                            alt="SafeHome logo"
                            role="img" // needed for VoiceOver bug: https://bugs.webkit.org/show_bug.cgi?id=216364
                            height="auto"
                            width="auto"
                            display="inline"
                          />
                        </div>

                        <div>{initialAddress}</div>
                      </Flex>
                    </Card.Title>
                  </Card.Header>
                  <Card.Body pt="3">
                    <ReportHazards
                      variant="cardhazardsummary"
                      addressHazardData={addressHazardData}
                      isHazardDataLoading={isHazardDataLoading}
                      toggledStates={toggledStates}
                      setToggledStates={setToggledStates}
                      setLayerToggleObj={setLayerToggleObj}
                      stackDirectionResponsive={true}
                    />
                  </Card.Body>
                </Card.Root>
              </Box>
              <Box zIndex="docked" top="56" right="20" position="absolute">
                <AlertInfo message="72% chance of major Bay Area earthquake in the next 30 years"></AlertInfo>
              </Box>
            </>
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
      {CurrentVariant === "data-centric" && !isMobile && (
        <Box bgColor="peach">
          <Box pt="8" pb="4" px="8">
            <Heading as="h2" pb="4">
              <Text
                as="span"
                textStyle="headerBig"
                layerStyle="headerMain"
                color="black"
                fontWeight="light"
              >
                What your risks mean
              </Text>
            </Heading>

            <Center>
              <ReportHazards
                variant="reporthazardsummary"
                addressHazardData={addressHazardData}
                isHazardDataLoading={isHazardDataLoading}
                toggledStates={toggledStates}
                setToggledStates={setToggledStates}
                setLayerToggleObj={setLayerToggleObj}
                stackDirectionResponsive={true}
              />
            </Center>
          </Box>
          <Box pt="8" pb="4" px="8">
            <Heading as="h2">
              <Stack gap="3">
                <Text
                  as="span"
                  textStyle="headerBig"
                  layerStyle="headerMain"
                  color="black"
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
          <Center py="4" px="8">
            <Flex bg="blue.50" p="4" borderRadius="md" mt="4" gap="6">
              <div>
                <Image
                  src="/images/SFCivicTech-Rights.svg"
                  alt="SafeHome logo"
                  role="img" // needed for VoiceOver bug: https://bugs.webkit.org/show_bug.cgi?id=216364
                  height="auto"
                  width="auto"
                  display="inline"
                />
              </div>
              <div>
                <Text fontSize="lg" fontWeight="bold" mb="3">
                  Renting? Know your rights.
                </Text>
                <Text>
                  If you live in a non-compliant building or high-risk zone, you
                  have options. Get earthquake renters insurance to protect your
                  belongings, or learn about your right to report unsafe living
                  conditions to the city.
                </Text>
              </div>
            </Flex>
          </Center>
        </Box>
      )}
    </>
  );
};

export default AddressMapper;
