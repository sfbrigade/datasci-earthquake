import {
  Box,
  Center,
  Collapse,
  Stack,
  Text,
  Icon,
  Card,
} from "@chakra-ui/react";
import { FaCircle, FaSquareFull } from "react-icons/fa";
import CardHazard from "./card-hazard";
import { Hazards } from "../data/data";
import { AddressData } from "./__mocks__/address-data";
import Share from "./share";
import { CardContainer } from "./card-container";
import { KeyElem } from "./key-elem";

type HazardData = {
  softStory?: any;
  tsunami?: any;
  liquefaction?: any;
};

const ReportHazards = ({
  searchedAddress,
  addressHazardData,
  isHazardDataLoading,
}: {
  searchedAddress: string;
  addressHazardData: HazardData;
  isHazardDataLoading: boolean;
}) => {
  const hazardData = "";

  return (
    <Center flexDirection="column">
      <Box
        w="100vw"
        py={2}
        bgColor="white"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          w={{ base: "full", xl: "7xl" }}
          px={{
            base: "24px",
            md: "28px",
            xl: "128px",
          }}
          spacing={{ base: 1, md: 5 }}
          direction={{ base: "column", md: "row" }}
          alignItems="center"
        >
          <Text textStyle="textMedium" fontWeight="700">
            Legend:
          </Text>
          <KeyElem name="Soft story" color="grey.400" icon={<FaCircle />} />
          <KeyElem
            name="Liquefaction areas"
            color="orange"
            icon={<FaSquareFull />}
          />
          <KeyElem
            name="Tsunami zone"
            color="tsunamiBlue"
            icon={<FaSquareFull />}
          />
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
