import {
  Accordion,
  Box,
  Button,
  Icon,
  Menu,
  Portal,
  Span,
} from "@chakra-ui/react";
import MobileCardHazard from "./mobile-card-hazard";
import { Hazards } from "../data/data";
import { Dispatch, SetStateAction } from "react";
import { LayerToggleObjProps } from "./address-mapper";
import { FaAngleUp, FaAngleDown } from "react-icons/fa6";

type HazardData = { softStory?: any; tsunami?: any; liquefaction?: any };

const MobileReportHazards = ({
  showHazards,
  addressHazardData,
  isHazardDataLoading,
  toggledStates,
  setShowHazards,
  setToggledStates,
  setLayerToggleObj,
}: {
  showHazards: boolean;
  addressHazardData: HazardData;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
  setShowHazards: Dispatch<SetStateAction<boolean>>;
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}) => {
  return (
    <Menu.Root
      positioning={{ flip: false }}
      onOpenChange={(e) => setShowHazards(e.open)}
    >
      <Box pt="8" px="8" zIndex="docked" position="relative">
        <Menu.Trigger asChild>
          <Button
            textStyle={"textMedium"}
            layerStyle={"mobileButton"}
            fontWeight="bold"
            shadow="mobileButton"
          >
            <Span mr="2">Legend</Span>
            {!showHazards ? (
              <Icon size={"sm"}>
                <FaAngleDown />
              </Icon>
            ) : (
              <Icon size={"sm"}>
                <FaAngleUp />
              </Icon>
            )}
          </Button>
        </Menu.Trigger>
        <Portal>
          <Menu.Positioner>
            <Menu.Content p="0" borderRadius="2xl" py="3" w="full">
              <Accordion.Root
                collapsible={true}
                defaultValue={[Hazards[0].name]}
              >
                {Hazards.map((hazard) => {
                  return (
                    <MobileCardHazard
                      key={hazard.id}
                      hazard={hazard}
                      hazardData={
                        addressHazardData?.[hazard.name as keyof HazardData] ??
                        undefined
                      }
                      showData={hazard.name in addressHazardData ? true : false}
                      isHazardDataLoading={isHazardDataLoading}
                      toggledStates={toggledStates}
                      setToggledStates={setToggledStates}
                      setLayerToggleObj={setLayerToggleObj}
                    />
                  );
                })}
              </Accordion.Root>
            </Menu.Content>
          </Menu.Positioner>
        </Portal>
      </Box>
    </Menu.Root>
  );
};

export default MobileReportHazards;
