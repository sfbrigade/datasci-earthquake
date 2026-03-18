import { Box } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { Hazards } from "../data/data";
import { CardContainer } from "./card-container";
import { Dispatch, SetStateAction } from "react";
import { LayerToggleObjProps } from "./address-mapper";
import CardHazardSummary from "./card-hazard-summary";
import CardRisk from "./card-risk";

type HazardData = { softStory?: any; tsunami?: any; liquefaction?: any };
const ReportHazards = ({
  variant,
  addressHazardData,
  isHazardDataLoading,
  toggledStates,
  setToggledStates,
  setLayerToggleObj,
  isInDrawer = false,
}: {
  variant: "map-centric" | "cardhazardsummary" | "reporthazardsummary";
  addressHazardData: HazardData;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
  isInDrawer?: boolean;
}) => {
  return (
    <Box>
      <CardContainer padded={variant !== "map-centric" || !isInDrawer}>
        {Hazards.map((hazard) => {
          if (variant === "cardhazardsummary") {
            return (
              <CardHazardSummary
                address={
                  "address" in addressHazardData ? "address" : "No Address"
                }
                key={hazard.id}
                hazard={hazard}
                hazardData={
                  addressHazardData?.[hazard.name as keyof HazardData] ??
                  undefined
                }
                showData={hazard.name in addressHazardData ? true : false}
                isHazardDataLoading={false}
                toggledStates={[]}
              />
            );
          }
          if (variant === "reporthazardsummary") {
            return (
              <CardRisk
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
          }
          if (variant === "map-centric") {
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
                fullWidth={isInDrawer}
              />
            );
          }
        })}
      </CardContainer>
    </Box>
  );
};

export default ReportHazards;
