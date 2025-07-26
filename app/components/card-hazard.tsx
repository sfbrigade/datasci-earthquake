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
} from "@chakra-ui/react";
import posthog from "posthog-js";
import Pill from "./pill";
import { RxCross2 } from "react-icons/rx";
import { PillLabels } from "../data/data";

interface CardHazardProps {
  hazard: {
    id: number;
    name: string;
    title: string;
    description: string;
    info: string[];
    link: { label: string; url: string };
  };
  hazardData?: { exists?: boolean; last_updated?: string };
  showData: boolean;
  isHazardDataLoading: boolean;
}

const CardHazard: React.FC<CardHazardProps> = ({
  hazard,
  hazardData,
  showData,
  isHazardDataLoading,
}) => {
  const { title, name, description } = hazard;
  const { exists, last_updated: date } = hazardData || {};
  const labelInfo = PillLabels.filter((label) => label.name === hazard.name)[0];

  const hazardPill = isHazardDataLoading ? (
    <Spinner size="xs" />
  ) : showData ? (
    <Pill
      exists={exists}
      trueData={labelInfo.trueData}
      falseData={labelInfo.falseData}
      noData={labelInfo.noData}
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
    <Card.Root flex={1} maxW={400} p={{ base: "16px", md: "20px" }}>
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
            <Card.Header p={0} marginBottom={"0.5em"} textAlign="left">
              <Text
                textStyle="cardTitle"
                layerStyle="headerAlt"
                fontWeight={"700"}
              >
                {title}
              </Text>
            </Card.Header>
            <Card.Body textAlign="left" p={0} mb={"14px"}>
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
