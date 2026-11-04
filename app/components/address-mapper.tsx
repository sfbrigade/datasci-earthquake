"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import {
  Box,
  Button,
  HStack,
  Text,
  useBreakpointValue,
} from "@chakra-ui/react";

import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";
import SHDrawer, { MOBILE_DRAWER_HEIGHT_RATIO } from "./drawer";
import AlertInfo from "./ui/alert-info";
import NextLink from "@/components/custom-next-link";
import { useMapState } from "./map-state-provider";

const defaultCoords = [-122.4194, 37.7949];

const toggledStatesDefaults = [true, true, true];

export type LayerToggleObjProps = {
  layerIds: string[];
  toggleState: boolean;
};

const AddressMapper = () => {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { setSearchComplete } = useMapState();

  const initialLon = searchParams.get("lon");
  const initialLat = searchParams.get("lat");
  const initialAddress = searchParams.get("address");

  // TODO: actually validate params with eg Zod
  const validParams = Boolean(initialLon && initialLat && initialAddress);

  const [lon, lat] = validParams
    ? [parseFloat(initialLon as string), parseFloat(initialLat as string)]
    : defaultCoords;

  const [addressHazardData, setAddressHazardData] = useState<object>({});

  const displayData = validParams ? addressHazardData : {};

  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
  const [isDrawerOpen, setDrawerOpen] = useState(true);
  const isMobile = useBreakpointValue({ base: true, md: false }) ?? true;
  const bottomPaddingRatio =
    isMobile && isDrawerOpen ? MOBILE_DRAWER_HEIGHT_RATIO : 0;

  const [toggledStates, setToggledStates] = useState<boolean[]>(
    toggledStatesDefaults
  );

  const [layerToggleObj, setLayerToggleObj] = useState<LayerToggleObjProps>({
    layerIds: [],
    toggleState: true,
  });

  const { fetchHazardData } = useHazardDataFetcher({
    setSearchComplete,
    setHazardDataLoading,
  });

  const currentQueryString = searchParams.toString();

  // TODO: merge this logic with getNavigationHref
  const prepareHref = currentQueryString
    ? `/prepare?${currentQueryString}`
    : "/prepare";

  useEffect(() => {
    let isCurrent = true;

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

        if (isCurrent) {
          setAddressHazardData({
            softStory: null,
            tsunami: null,
            liquefaction: null,
            femaRisk: null,
          });
        }

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
    }

    void updateHazardData([
      parseFloat(initialLon as string),
      parseFloat(initialLat as string),
    ]);

    return () => {
      isCurrent = false;
    };
  }, [validParams, initialLon, initialLat, fetchHazardData]);

  return (
    <Box w="full" h="full" m="auto" position="relative">
      <Box h="full" overflow="hidden">
        <SHDrawer
          open={isDrawerOpen}
          onOpenChange={setDrawerOpen}
          title="Risk Layers"
          footerText={
            <Box hideBelow="sm">
              <AlertInfo message="72% chance of major Bay Area earthquake in the next 30 years" />
            </Box>
          }
        >
          <ReportHazards
            addressHazardData={displayData}
            isHazardDataLoading={isHazardDataLoading}
            toggledStates={toggledStates}
            setToggledStates={setToggledStates}
            setLayerToggleObj={setLayerToggleObj}
            isInDrawer={true}
          />
          {/* Start button --> Prepare tab */}
          {pathname !== "/prepare" && (
            <HStack bg="gray.50" p="5" mt="4">
              <Text textStyle="textStart" layerStyle="text">
                Take action &amp; Prepare for earthquake
              </Text>

              <Button asChild size="sm">
                <NextLink href={prepareHref}>Start</NextLink>
              </Button>
            </HStack>
          )}
        </SHDrawer>

        <Map
          lon={lon}
          lat={lat}
          address={initialAddress}
          layerToggleObj={layerToggleObj}
          bottomPaddingRatio={bottomPaddingRatio}
        />
      </Box>
    </Box>
  );
};

export default AddressMapper;
