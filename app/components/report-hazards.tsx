import { Box, Center, Stack, Switch, Text } from "@chakra-ui/react";
import { FaCircle, FaSquareFull } from "react-icons/fa";
import CardHazard from "./card-hazard";
import { Hazards, LayerIds } from "../data/data";
import { CardContainer } from "./card-container";
import { KeyElem } from "./key-elem";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { LayerToggleObjProps } from "./address-mapper";

type HazardData = { softStory?: any; tsunami?: any; liquefaction?: any };
type ToggledStatesProps = boolean[];

const ReportHazards = ({
  addressHazardData,
  isHazardDataLoading,
  setLayerToggleObj,
}: {
  addressHazardData: HazardData;
  isHazardDataLoading: boolean;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}) => {
  const [toggledStates, setToggledStates] = useState<ToggledStatesProps>([]);

  useEffect(() => {
    const toggledStatesDefaults: boolean[] = [];
    LayerIds.forEach(() => toggledStatesDefaults.push(true));
    setToggledStates(toggledStatesDefaults);
  }, []);

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
    <Center flexDirection="column">
      <Box
        w="100vw"
        py="2"
        bgColor="white"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          w={{ base: "full", xl: "7xl" }}
          px={{ base: "24px", md: "28px", xl: "128px" }}
          gap={{ base: 1, md: 5 }}
          direction={{ base: "column", md: "row" }}
          alignItems="center"
        >
          <Text textStyle="textMedium" layerStyle="text" fontWeight="700">
            Legend:
          </Text>
          <KeyElem name="Soft story" color="grey.400" icon={<FaCircle />} />
          {/* TODO: in the event this section of code handling the legends isn't
          completely remove, it should be refactored by taking the values of
          each property from the KeyElems and placing them into an array,
          allowing the legends to be mapped out. The index argument could/should
          be used during mapping. */}
          <Switch.Root
            checked={toggledStates[0]}
            onCheckedChange={(e) => handleSwitchClick(0, e.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label />
          </Switch.Root>
          <KeyElem
            name="Liquefaction areas"
            color="orange"
            icon={<FaSquareFull />}
          />
          <Switch.Root
            checked={toggledStates[1]}
            onCheckedChange={(e) => handleSwitchClick(1, e.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label />
          </Switch.Root>
          <KeyElem
            name="Tsunami zone"
            color="tsunamiBlue"
            icon={<FaSquareFull />}
          />
          <Switch.Root
            checked={toggledStates[2]}
            onCheckedChange={(e) => handleSwitchClick(2, e.checked)}
          >
            <Switch.HiddenInput />
            <Switch.Control />
            <Switch.Label />
          </Switch.Root>
        </Stack>
      </Box>
      <CardContainer>
        {Hazards.map((hazard) => {
          return (
            <CardHazard
              key={hazard.id}
              hazard={hazard}
              hazardData={
                addressHazardData?.[hazard.name as keyof HazardData] ??
                undefined
              }
              showData={hazard.name in addressHazardData ? true : false}
              isHazardDataLoading={isHazardDataLoading}
            />
          );
        })}
      </CardContainer>
    </Center>
  );
};

export default ReportHazards;
