import { Box, HStack, IconButton, Text } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { AddressData } from "./__mocks__/address-data";
import { Hazards } from "../data/data";
import Share from "./share";

const Report = () => {
  return (
    <Box>
      <HStack
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        mb="16px"
        gap="0"
      >
        {AddressData.address && (
          <Text textStyle="headerMedium">{AddressData.address}</Text>
        )}
        <Share />
      </HStack>
      <HStack
        justifyContent="space-between"
        alignItems="stretch"
        flexDirection={{ base: "column", md: "row" }}
        mb="16px"
      >
        {Hazards.map((hazard) => {
          return <CardHazard key={hazard.id} hazard={hazard} />;
        })}
      </HStack>
    </Box>
  );
};

export default Report;
