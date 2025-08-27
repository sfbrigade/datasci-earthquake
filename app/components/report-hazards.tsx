import { Box } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { Hazards, LayerIds } from "../data/data";
import { CardContainer } from "./card-container";
import { useState, useEffect, Dispatch, SetStateAction } from "react";
import { LayerToggleObjProps } from "./address-mapper";

type HazardData = { softStory?: any; tsunami?: any; liquefaction?: any };
type ToggledStatesProps = boolean[];

const toggledStatesDefaults = [true, true, true];

const ReportHazards = ({
  addressHazardData,
  isHazardDataLoading,
  setLayerToggleObj,
}: {
  addressHazardData: HazardData;
  isHazardDataLoading: boolean;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}) => {
  const [toggledStates, setToggledStates] = useState<ToggledStatesProps>(
    toggledStatesDefaults
  );

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
    <Box>
      <CardContainer>
        {Hazards.map((hazard, index) => {
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
              checkedState={toggledStates[index]}
              handleSwitchClick={handleSwitchClick}
            />
          );
        })}
      </CardContainer>
    </Box>
  );
};

export default ReportHazards;
