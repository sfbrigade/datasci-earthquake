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
  Button,
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
  // const posthog = usePostHog();

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
    return (
      <VStack gap={5} p={5}>
        {hazard.info.map((infoItem, index) => (
          <Text key={index}>{infoItem}</Text>
        ))}
      </VStack>
    );
  };

  return (
    <Card.Root flex={1} maxW={400} p={{ base: "16px", md: "20px" }}>
      <Popover.Root
        positioning={{
          placement: "bottom",
          offset: { crossAxis: 0, mainAxis: 0 },
        }}
        closeOnEscape={true}
        closeOnInteractOutside={true}
        aria-label={`${hazard.title} information`}
      >
        <Popover.Trigger css={{ backgroundColor: "white" }}>
          <VStack cursor={"pointer"} alignItems={"flex-start"} h={"100%"}>
            <Card.Header p={0} marginBottom={"0.5em"}>
              <Text
                textStyle="cardTitle"
                layerStyle="headerAlt"
                fontWeight={"700"}
              >
                {title}
              </Text>
            </Card.Header>
            {/* TODO: shouldn't need text align left (temporary fix) ... something else is causing the text to be centered; looking into it further, there's a text align center somewhere, possibly as part of an enclosing button element, so we may need this after all */}
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
            {/* TODO FIXME: can below line be styled with mt={5} width={"348px"} somehow still? how? should it go on `<Popover.Body>`? or elsewhere? */}
            <Popover.Content>
              {/* TODO FIXME: can below line replace the <PopoverCloseButton />? */}
              <Popover.CloseTrigger
                display={"flex"}
                justifyContent="end"
                paddingRight="3"
                paddingTop="3"
              >
                <RxCross2
                  color="grey.900"
                  fontSize="1.1em"
                  size="20"
                  data-testid="clear-icon"
                />
              </Popover.CloseTrigger>
              <Popover.Arrow>
                <Popover.ArrowTip />
              </Popover.Arrow>
              <Popover.Body
                css={{ backgroundColor: "white", borderRadius: "6px" }}
              >
                {buildHazardCardInfo()}
                <Link
                  display={"inline-block"}
                  pb={3}
                  pl={5}
                  href={hazard.link.url}
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
