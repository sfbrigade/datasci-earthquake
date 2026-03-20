"use client";

import { Box, Button, Card, Collapsible, HStack, Link, Spinner, Switch, Text, VStack } from "@chakra-ui/react";
import { FaCircle, FaSquareFull } from "react-icons/fa";
import { capturePosthogEvent } from "../lib/posthog-client";
import { PillData, LayerIds } from "../data/data";
import Pill from "./pill";
import { KeyElem } from "./key-elem";
import { LayerToggleObjProps } from "./address-mapper";
import { Dispatch, SetStateAction } from "react";

type HazardInfo = {
  id: number;
  name: string;
  title: string;
  description: string;
  info: string[];
  link: { label: string; url: string };
  icon: string;
  iconColor: string;
};

interface HazardDrawerCardProps {
  hazard: HazardInfo;
  hazardData?: { exists?: boolean; last_updated?: string };
  showData: boolean;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}

const HazardDrawerCard = ({
  hazard,
  hazardData,
  showData,
  isHazardDataLoading,
  toggledStates,
  setToggledStates,
  setLayerToggleObj,
}: HazardDrawerCardProps) => {
  const { id, title, name, description, icon, iconColor } = hazard;
  const { exists } = hazardData || {};
  const pillTextOptions = PillData.find((object) => object.name === name) ?? {
    trueData: "No Data",
    falseData: "No Data",
    noData: "No Data",
  };

  // Map custom color strings to Chakra color tokens
  const colorMap = {
    "grey.400": "gray.400",
    orange: "orange.500",
    tsunamiBlue: "blue.400",
  } as const;
  const chakraColor: string = colorMap[iconColor as keyof typeof colorMap] || "gray.400";

  const hazardPill = isHazardDataLoading ? (
    <Spinner size="xs" />
  ) : showData ? (
    <Pill
      exists={exists}
      trueData={pillTextOptions.trueData}
      falseData={pillTextOptions.falseData}
      noData={pillTextOptions.noData}
    />
  ) : null;

  const handleSwitchClick = (num: number, checked: boolean) => {
    const next = [...toggledStates];
    next[num] = checked;
    setToggledStates(next);
    setLayerToggleObj({ layerId: LayerIds[num], toggleState: checked });
  };

  return (
    <Card.Root
      shadow="sm"
      bg="white"
      borderRadius="xl"
      css={{
        border: "1px solid",
        borderColor: "rgba(0, 0, 0, 0.08)",
      }}
    >
      <Collapsible.Root>
        <Card.Body p="4">
          <VStack align="stretch" gap="3">
            <HStack justify="space-between" align="start">
              <KeyElem
                name={title}
                color={chakraColor as any}
                icon={icon === "circle" ? <FaCircle /> : <FaSquareFull />}
              />
              <Switch.Root
                size="lg"
                colorPalette="blue"
                checked={toggledStates[id]}
                onCheckedChange={(e) => handleSwitchClick(id, e.checked)}
                defaultChecked
              >
                <Switch.HiddenInput />
                <Switch.Control />
              </Switch.Root>
            </HStack>

            <Text textStyle="textSmall" color="gray.800">
              {description}
            </Text>

            <HStack justify="space-between" align="center">
              <Collapsible.Trigger asChild>
                <Button
                  size="sm"
                  variant="ghost"
                  px="0"
                  color="blue.text"
                  onClick={() => {
                    void capturePosthogEvent("more-info-clicked", {
                      hazard_name: hazard.name,
                    });
                  }}
                >
                  More info
                </Button>
              </Collapsible.Trigger>
              {hazardPill}
            </HStack>

            <Collapsible.Content>
              <Box pt="1">
                {hazard.info.map((infoItem, index) => (
                  <Text key={index} as="p" mt={index === 0 ? "0" : "3"} textStyle="textSmall" color="gray.700">
                    {infoItem}
                  </Text>
                ))}
                <Link
                  display="inline-block"
                  mt="3"
                  href={hazard.link.url}
                  target="_blank"
                  textDecoration="underline"
                  color="blue.text"
                  onClick={() =>
                    void capturePosthogEvent("dataset-link-clicked", {
                      link_name: hazard.link.label,
                    })
                  }
                >
                  {hazard.link.label}
                </Link>
              </Box>
            </Collapsible.Content>
          </VStack>
        </Card.Body>
      </Collapsible.Root>
    </Card.Root>
  );
};

export default HazardDrawerCard;
