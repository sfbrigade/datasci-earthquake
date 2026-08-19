"use client";

import { useEffect, useState } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { Box, Button, HStack, Text } from "@chakra-ui/react";
import { FeatureCollection, Geometry } from "geojson";

import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";
import SHDrawer from "./drawer";
import AlertInfo from "./ui/alert-info";
import NextLink from "@/components/custom-next-link";
import { useMapState } from "./map-state-provider";

const defaultCoords = [-122.4194, 37.7949];

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

type ErrorResult = {
  error: true;
  message: string;
};

const isErrorResult = (data: unknown): data is ErrorResult => {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    (data as ErrorResult).error === true
  );
};

const AddressMapper: React.FC<AddressMapperProps> = ({
  softStoryData,
  tsunamiData,
  liquefactionData,
}) => {
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

  const [toggledStates, setToggledStates] = useState<boolean[]>(
    toggledStatesDefaults
  );

  const [layerToggleObj, setLayerToggleObj] = useState<LayerToggleObjProps>({
    layerId: "",
    toggleState: true,
  });

  const toastIdDataLoadFailed = "data-load-failed";

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

  useEffect(() => {
    const sources = [
      {
        name: "Soft Story Buildings",
        data: softStoryData,
      },
      {
        name: "Tsunami Zones",
        data: tsunamiData,
      },
      {
        name: "Liquefaction Zones",
        data: liquefactionData,
      },
    ];

    const errors = sources
      .filter((source) => isErrorResult(source.data))
      .map(
        (source) =>
          `${source.name}: ${
            (source.data as unknown as ErrorResult).message || "Unknown error"
          }`
      );

    if (errors.length > 0 && !toaster.isVisible(toastIdDataLoadFailed)) {
      toaster.create({
        id: toastIdDataLoadFailed,
        title: "Data Load Error",
        description: errors.join(" | "),
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  }, [softStoryData, tsunamiData, liquefactionData]);

  return (
    <Box w="full" h="full" m="auto" position="relative">
      <Box h="full" overflow="hidden">
        <SHDrawer
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
          softStoryData={softStoryData}
          tsunamiData={tsunamiData}
          liquefactionData={liquefactionData}
          layerToggleObj={layerToggleObj}
        />
      </Box>
    </Box>
  );
};

export default AddressMapper;
