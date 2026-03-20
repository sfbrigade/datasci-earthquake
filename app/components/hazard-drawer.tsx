"use client";

import {
  Box,
  Button,
  HStack,
  Text,
  VStack,
  useBreakpointValue,
} from "@chakra-ui/react";
import { Dispatch, SetStateAction, useEffect, useMemo, useState } from "react";
import { Hazards } from "../data/data";
import HazardDrawerCard from "./hazard-drawer-card";
import { LayerToggleObjProps } from "./address-mapper";

type HazardData = { softStory?: any; tsunami?: any; liquefaction?: any };

type HazardDrawerProps = {
  addressHazardData: HazardData;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
  searchedAddress: string | null;
};

const HazardDrawer = ({
  addressHazardData,
  isHazardDataLoading,
  toggledStates,
  setToggledStates,
  setLayerToggleObj,
  searchedAddress,
}: HazardDrawerProps) => {
  const isDesktop = useBreakpointValue({ base: false, lg: true }) ?? false;
  const desktopClosed = -320;
  const mobileClosed = 316;
  const [translate, setTranslate] = useState(mobileClosed);
  const [dragStart, setDragStart] = useState<number | null>(null);
  const [dragOrigin, setDragOrigin] = useState(0);

  const closedTranslate = useMemo(
    () => (isDesktop ? desktopClosed : mobileClosed),
    [isDesktop]
  );

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTranslate(isDesktop ? 0 : mobileClosed);
  }, [isDesktop]);

  const clampTranslate = (value: number) => {
    if (isDesktop) {
      return Math.max(desktopClosed, Math.min(0, value));
    }
    return Math.max(0, Math.min(mobileClosed, value));
  };

  const handlePointerDown = (event: React.PointerEvent<HTMLDivElement>) => {
    const coord = isDesktop ? event.clientX : event.clientY;
    setDragStart(coord);
    setDragOrigin(translate);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart === null) return;
    const coord = isDesktop ? event.clientX : event.clientY;
    const delta = coord - dragStart;
    const next = clampTranslate(dragOrigin + delta);
    setTranslate(next);
  };

  const endDrag = () => {
    if (dragStart === null) return;
    const midpoint = isDesktop ? desktopClosed / 2 : mobileClosed / 2;
    if (isDesktop) {
      setTranslate(translate > midpoint ? 0 : desktopClosed);
    } else {
      setTranslate(translate < midpoint ? 0 : mobileClosed);
    }
    setDragStart(null);
  };

  const isOpen = isDesktop
    ? translate > desktopClosed / 2
    : translate < mobileClosed / 2;

  return (
    <Box
      position="absolute"
      zIndex="overlay"
      pointerEvents="none"
      css={{
        inset: "auto 0 0 0",
        "@media (min-width: 1024px)": {
          inset: "0 auto 0 0",
        },
      }}
    >
      <Box
        pointerEvents="auto"
        borderTopRadius={{ base: "2xl", lg: "none" }}
        borderRightRadius={{ base: "none", lg: "2xl" }}
        boxShadow="lg"
        transform={
          isDesktop
            ? `translate3d(${translate}px, 0, 0)`
            : `translate3d(0, ${translate}px, 0)`
        }
        css={{
          transition: dragStart === null ? "transform 220ms ease" : "none",
          width: "100vw",
          height: "23rem",
          "@media (min-width: 1024px)": {
            width: "23rem",
            height: "100%",
          },
          background: "rgba(255, 255, 255, 0.96)",
          backdropFilter: "blur(14px)",
          border: "1px solid",
          borderColor: "rgba(0, 0, 0, 0.06)",
        }}
      >
        <Box
          onPointerDown={handlePointerDown}
          onPointerMove={handlePointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
          px="4"
          pt="3"
          pb="2"
          css={{
            touchAction: "none",
            cursor: isDesktop ? "ew-resize" : "ns-resize",
            borderBottom: "1px solid rgba(0, 0, 0, 0.06)",
          }}
        >
          <VStack align="stretch" gap="2">
            <HStack justify="space-between">
              <HStack gap="2">
                <Box
                  borderRadius="full"
                  bg="blackAlpha.300"
                  css={{
                    width: "3rem",
                    height: "1.5px",
                  }}
                />
                <Text fontWeight="bold" fontSize="sm">
                  Hazard layers
                </Text>
              </HStack>
              <Button
                size="xs"
                variant="ghost"
                onClick={() => setTranslate(isOpen ? closedTranslate : 0)}
              >
                {isOpen ? "Hide" : "Show"}
              </Button>
            </HStack>
            {searchedAddress ? (
              <Text
                fontSize="xs"
                color="gray.700"
                css={{
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                Report for {searchedAddress}
              </Text>
            ) : (
              <Text fontSize="xs" color="gray.700">
                Search an address to load a report.
              </Text>
            )}
          </VStack>
        </Box>

        <VStack
          align="stretch"
          gap="3"
          p="3"
          overflowY="auto"
          css={{ height: "calc(100% - 82px)" }}
        >
          {Hazards.map((hazard) => (
            <HazardDrawerCard
              key={hazard.id}
              hazard={hazard as any}
              hazardData={
                addressHazardData?.[hazard.name as keyof HazardData] ??
                undefined
              }
              showData={hazard.name in addressHazardData}
              isHazardDataLoading={isHazardDataLoading}
              toggledStates={toggledStates}
              setToggledStates={setToggledStates}
              setLayerToggleObj={setLayerToggleObj}
            />
          ))}
        </VStack>
      </Box>
    </Box>
  );
};

export default HazardDrawer;
