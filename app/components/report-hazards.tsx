import { Accordion, Box } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { Hazards } from "../data/data";
import { CardContainer } from "./card-container";
import { Dispatch, SetStateAction } from "react";
import { LayerToggleObjProps } from "./address-mapper";

type HazardData = { softStory?: any; tsunami?: any; liquefaction?: any };

const ReportHazards = ({
  addressHazardData,
  isHazardDataLoading,
  toggledStates,
  setToggledStates,
  setLayerToggleObj,
}: {
  addressHazardData: HazardData;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}) => {
  return (
    <Box>
      <Accordion.Root collapsible={true}>
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
                toggledStates={toggledStates}
                setToggledStates={setToggledStates}
                setLayerToggleObj={setLayerToggleObj}
              />
            );
          })}
        </CardContainer>
      </Accordion.Root>
    </Box>
  );
};

export default ReportHazards;
