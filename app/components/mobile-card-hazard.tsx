"use client";

import {
  Text,
  HStack,
  VStack,
  Link,
  Card,
  Spinner,
  Accordion,
  Switch,
  Separator,
  Collapsible,
} from "@chakra-ui/react";
import posthog from "posthog-js";
import Pill from "./pill";
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
    iconColor: string;
  };
  hazardData?: { exists?: boolean; last_updated?: string };
  showData: boolean;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}

const MobileCardHazard: React.FC<CardHazardProps> = ({
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
      <Text as="p" mt="1.5" key={index} textStyle="textXSmall">
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
      w="86vw"
      p={"8px 12px"}
      // boxShadow="0px 5px 6px #c8caceff"
      variant="elevated"
      borderRadius={0}
    >
      <Accordion.Item border="none" w="98%" value={hazard.name}>
        <Accordion.ItemTrigger p={0} w={"100%"}>
          <Card.Header
            w="100%"
            p={0}
            textAlign="left"
            flexDirection="row"
            justifyContent="space-between"
          >
            <KeyElem
              name={title}
              color={iconColor}
              icon={icon === "circle" ? <FaCircle /> : <FaSquareFull />}
              isMobile={true}
            />
            {hazardPill}
          </Card.Header>
        </Accordion.ItemTrigger>
        <Accordion.ItemContent maxHeight="unset">
          <Accordion.ItemBody pb={0}>
            <Collapsible.Root onOpenChange={(e) => setIsMoreInfo(e.open)}>
              <Card.Body textAlign="left" p={0}>
                <HStack justifyContent="space-between">
                  <Text textStyle="textXSmall" layerStyle="text">
                    {description}
                  </Text>
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
                </HStack>
              </Card.Body>
              <Card.Footer p={0} width={"100%"}>
                <Collapsible.Trigger>
                  <Text
                    textStyle="textXSmall"
                    cursor={"pointer"}
                    textDecoration={"underline"}
                    fontWeight={"bold"}
                  >
                    {!isMoreInfo ? "More info" : "Less info"}
                  </Text>
                </Collapsible.Trigger>
              </Card.Footer>
              <Collapsible.Content>
                <Separator mt="2" />
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
                  textStyle={"textXSmall"}
                  fontWeight={"bold"}
                >
                  {hazard.link.label}
                </Link>
              </Collapsible.Content>
            </Collapsible.Root>
          </Accordion.ItemBody>
        </Accordion.ItemContent>
      </Accordion.Item>
    </Card.Root>
  );
};

export default MobileCardHazard;
