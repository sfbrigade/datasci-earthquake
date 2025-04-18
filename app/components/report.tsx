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

const Report = ({
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
      <Collapse
        endingHeight="74px"
        in={searchedAddress.length > 0}
        style={{ overflow: "visible" }}
      >
        <Box
          w="100vw"
          py={2}
          borderBottomWidth="1px"
          borderColor="rgba(0, 0, 0, 0.3)"
          bgColor="white"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Stack
            w={{ base: "base", xl: "xl" }}
            px={{
              base: "23px",
              md: "26px",
              xl: "127px",
            }}
            direction={{ base: "column", sm: "row" }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack
              direction={{ base: "column", md: "row" }}
              alignItems={{ base: "flex-start", md: "center" }}
              spacing={{ base: 0, md: 1 }}
            >
              <Text
                textStyle="headerSmall"
                fontWeight="normal"
                fontSize="22px"
                color="gray.900"
              >
                Report for:
              </Text>
              <Text
                textStyle="headerMedium"
                fontWeight="normal"
                color="gray.900"
                pb="4px"
              >
                {searchedAddress}
              </Text>
            </Stack>
            <Share />
          </Stack>
        </Box>
      </Collapse>
      <Box
        w="100vw"
        py={2}
        boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
        bgColor="white"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Stack
          w={{ base: "base", xl: "xl" }}
          px={{
            base: "23px",
            md: "26px",
            xl: "127px",
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

export default Report;
