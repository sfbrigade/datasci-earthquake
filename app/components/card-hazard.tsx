"use client";

import {
  Text,
  HStack,
  VStack,
  Link,
  Card,
  Spinner,
  Accordion,
  Portal,
  Switch,
} from "@chakra-ui/react";
import posthog from "posthog-js";
import Pill from "./pill";
import { RxCross2 } from "react-icons/rx";
import { PillData, LayerIds } from "../data/data";
import { FaCircle, FaSquareFull } from "react-icons/fa";
import { KeyElem } from "./key-elem";
import { Dispatch, SetStateAction } from "react";
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
    iconColor: string;
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
    const newArray = [];
    const obj = {
      layerId: LayerIds[num],
      toggleState: checked,
    };
    for (let i = 0; i < toggledStates.length; i++) {
      if (i === num) newArray.push(checked);
      else newArray.push(toggledStates[i]);
    }
    setToggledStates(newArray);
    setLayerToggleObj(obj);
  };

  return (
    <Card.Root
      flex={1}
      maxW={{ base: 336 }}
      minH={{ base: 184 }}
      p={{ base: "14px 16px", md: "18px 20px" }}
      // boxShadow="0px 5px 6px #c8caceff"
      variant="elevated"
    >
      <Accordion.Item border="none"
        /*
        closeOnEscape={true}
        closeOnInteractOutside={true}
        aria-label={`${hazard.title} information`} 
      */
        value={hazard.name}
      >
        <VStack alignItems={"flex-start"} flexGrow={1} h="full">
          <Card.Header
            w="102%"
            p={0}
            mb={"0.2em"}
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
            >
              <Switch.HiddenInput />
              <Switch.Control />
              <Switch.Label />
            </Switch.Root>
          </Card.Header>
          <Card.Body textAlign="left" p={0} mb={"6px"}>
            <Text textStyle="textMedium" layerStyle="text">
              {description}
            </Text>
          </Card.Body>
          <Card.Footer p={0} width={"100%"}>
            <HStack justifyContent="space-between" width="100%">
              <Accordion.ItemTrigger p={0}>
                <Text cursor={"pointer"} textDecoration={"underline"}>
                  More Info
                </Text>
              </Accordion.ItemTrigger>
              {hazardPill}
            </HStack>
          </Card.Footer>
        </VStack>
        <Accordion.ItemContent maxHeight="unset">
          {/* <Accordion.CloseTrigger
                cursor="pointer"
                position="absolute"
                top="2"
                right="2"
              >
                <RxCross2 color="grey.900" size="20" data-testid="clear-icon" />
              </Accordion.CloseTrigger> */}
          <Accordion.ItemBody>
            {buildHazardCardInfo()}
            <Link
              display={"inline-block"}
              href={hazard.link.url}
              mt="4"
              target="_blank"
              textDecoration="underline"
              onClick={() =>
                posthog.capture("dataset-link-clicked", {
                  link_name: hazard.link.label,
                })
              }
            >
              {hazard.link.label}
            </Link>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Card.Root>
  );
};

export default CardHazard;
