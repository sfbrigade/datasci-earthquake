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
} from "@chakra-ui/react";
import posthog from "posthog-js";
import Pill from "./pill";
import { RxCross2 } from "react-icons/rx";
import { PillData } from "../data/data";
import { FaCircle, FaSquareFull } from "react-icons/fa";
import { KeyElem } from "./key-elem";
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
  checkedState: boolean;
  handleSwitchClick: (num: number, checked: boolean) => void;
}

const CardHazard: React.FC<CardHazardProps> = ({
  hazard,
  hazardData,
  showData,
  isHazardDataLoading,
  checkedState,
  handleSwitchClick,
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

  return (
    <Card.Root
      flex={1}
      maxW={{ base: 400 }}
      p={{ base: "14px 16px", md: "18px 20px" }}
      // boxShadow="0px 5px 6px #c8caceff"
      variant="elevated"
    >
      <Popover.Root
        positioning={{
          placement: "bottom",
          flip: false,
          offset: { crossAxis: 0, mainAxis: 24 },
        }}
        closeOnEscape={true}
        closeOnInteractOutside={true}
        aria-label={`${hazard.title} information`}
      >
        <Popover.Trigger h="full">
          <VStack cursor={"pointer"} alignItems={"flex-start"} h="full">
            <Card.Header
              w="103%"
              p={0}
              // mb was originally 0.5em
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
                checked={checkedState}
                onCheckedChange={(e) => handleSwitchClick(id, e.checked)}
                defaultChecked
              >
                <Switch.HiddenInput />
                <Switch.Control />
                <Switch.Label />
              </Switch.Root>
            </Card.Header>
            {/* mb was originally 14px */}
            <Card.Body textAlign="left" p={0} mb={"6px"}>
              <Text textStyle="textMedium" layerStyle="text">
                {description}
              </Text>
            </Card.Body>
            <Card.Footer p={0} width={"100%"}>
              <HStack justifyContent="space-between" width="100%">
                <Text cursor={"pointer"} textDecoration={"underline"}>
                  More Info
                </Text>
                {hazardPill}
              </HStack>
            </Card.Footer>
          </VStack>
        </Popover.Trigger>
        <Portal>
          <Popover.Positioner>
            <Popover.Content maxHeight="unset">
              <Popover.CloseTrigger
                cursor="pointer"
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
                    posthog.capture("dataset-link-clicked", {
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
