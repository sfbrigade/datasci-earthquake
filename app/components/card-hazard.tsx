"use client";

import {
  Text,
  HStack,
  VStack,
  Link,
  Card,
  Spinner,
  Popover,
  Portal,
  Switch,
  SystemStyleObject,
} from "@chakra-ui/react";
import { capturePosthogEvent } from "../lib/posthog-client";
import Pill from "./pill";
import { RxCross2 } from "react-icons/rx";
import { PillData, LayerIds } from "../data/data";
import { FaCircle, FaSquareFull } from "react-icons/fa";
import { KeyElem } from "./key-elem";
import { Dispatch, SetStateAction, useState } from "react";
import { LayerToggleObjProps } from "./address-mapper";
interface CardHazardProps {
  hazard: {
    id: number;
    name: string;
    title: string;
    description: string;
    info: string[];
    link: { label: string; url: string };
    icon: string;
    iconColor: SystemStyleObject["color"];
  };
  hazardData?: { exists?: boolean; last_updated?: string };
  showData: boolean;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}

const CardHazard: React.FC<CardHazardProps> = ({
  hazard,
  hazardData,
  showData,
  isHazardDataLoading,
  toggledStates,
  setToggledStates,
  setLayerToggleObj,
}) => {
  const { id, title, name, description, icon, iconColor } = hazard;
  const { exists, last_updated: date } = hazardData || {};
  const pillTextOptions = PillData.find((object) => object.name === name) ?? {
    trueData: "No Data",
    falseData: "No Data",
    noData: "No Data",
  };
  const [isMoreInfo, setIsMoreInfo] = useState(false);

  const hazardPill = isHazardDataLoading ? (
    <Spinner size="xs" />
  ) : showData ? (
    <Pill
      exists={exists}
      trueData={pillTextOptions.trueData}
      falseData={pillTextOptions.falseData}
      noData={pillTextOptions.noData}
    />
  ) : (
    ""
  );

  const buildHazardCardInfo = () => {
    return hazard.info.map((infoItem, index) => (
      <Text as="p" mt="4" key={index}>
        {infoItem}
      </Text>
    ));
  };

  const handleSwitchClick = (num: number, checked: boolean) => {
    const newArray = [...toggledStates];
    newArray[num] = checked;
    setToggledStates(newArray);
    setLayerToggleObj({
      layerId: LayerIds[num],
      toggleState: checked,
    });
  };

  return (
    <Card.Root
      flex={1}
      maxW={{ base: "xs", "2xl": "sm" }}
      py={{ base: "3.5", md: "4" }}
      px={{ base: "4", md: "5" }}
      shadow="card"
      variant="elevated"
    >
      <Popover.Root
        positioning={{
          placement: "bottom",
          flip: false,
          offset: { crossAxis: -12, mainAxis: 24 },
          sameWidth: true,
        }}
        closeOnEscape={true}
        closeOnInteractOutside={true}
        aria-label={`${hazard.title} information`}
        onOpenChange={(e) => setIsMoreInfo(e.open)}
      >
        <VStack alignItems={"flex-start"} flexGrow={1} h="full">
          <Card.Header
            w="full"
            p="0"
            mb="1"
            textAlign="left"
            flexDirection="row"
            justifyContent="space-between"
          >
            <KeyElem
              name={title}
              color={iconColor}
              icon={icon === "circle" ? <FaCircle /> : <FaSquareFull />}
            />
            <Switch.Root
              size="lg"
              colorPalette="blue"
              checked={toggledStates[id]}
              onCheckedChange={(e) => handleSwitchClick(id, e.checked)}
              defaultChecked
              gap="0" // prevent whitespace on right side
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label />
            </Switch.Root>
          </Card.Header>
          <Card.Body textAlign="left" p="0" mb="1.5">
            <Text textStyle="cardTextMedium" layerStyle="text">
              {description}
            </Text>
          </Card.Body>
          <Card.Footer p="0" width="full">
            <HStack justifyContent="space-between" width="full">
              <Popover.Trigger>
                <Text
                  cursor="button"
                  textDecoration={"underline"}
                  onClick={() => {
                    if (!isMoreInfo) {
                      void capturePosthogEvent("more-info-clicked", {
                        hazard_name: hazard.name,
                      });
                    }
                  }}
                >
                  {!isMoreInfo ? "More info" : "Less info"}
                </Text>
              </Popover.Trigger>
              {hazardPill}
            </HStack>
          </Card.Footer>
        </VStack>
        <Portal>
          <Popover.Positioner>
            <Popover.Content maxHeight="unset">
              <Popover.CloseTrigger
                cursor="button"
                position="absolute"
                top="2"
                right="2"
              >
                <RxCross2 color="grey.900" size="20" data-testid="clear-icon" />
              </Popover.CloseTrigger>
              <Popover.Arrow>
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Popover.Body>
                {buildHazardCardInfo()}
                <Link
                  display={"inline-block"}
                  href={hazard.link.url}
                  mt="4"
                  target="_blank"
                  textDecoration="underline"
                  onClick={() =>
                    void capturePosthogEvent("dataset-link-clicked", {
                      link_name: hazard.link.label,
                    })
                  }
                >
                  {hazard.link.label}
                </Link>
              </Popover.Body>
            </Popover.Content>
          </Popover.Positioner>
        </Portal>
      </Popover.Root>
    </Card.Root>
  );
};

export default CardHazard;
