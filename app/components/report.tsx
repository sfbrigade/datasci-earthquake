import { Box, Card, Collapse, HStack, Text } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { Hazards } from "../data/data";
import { AddressData } from "./__mocks__/address-data";
import Share from "./share";

const Report = () => {
  return (
    <Box>
      <Collapse in={!!AddressData.address} style={{ overflow: "visible" }}>
        <Card
          w="100%"
          mb="16px"
          gap="0"
          px={{ base: 2, md: 10, lg: 20 }}
          pt={5}
          pb={2}
          borderRadius={0}
        >
          <Box
            display="flex"
            flexDirection={{ base: "column", sm: "row" }}
            alignItems="center"
            justifyContent={{
              base: "flex-end",
              sm: "space-between",
              md: "flex-end",
              lg: "center",
            }}
            width="100%"
            position="relative"
          >
            <Box
              position={{ base: "relative", md: "absolute" }}
              display="flex"
              left={0}
              flexDirection={{ base: "column", md: "row" }}
              mb={{ base: "5px", md: 0 }}
            >
              <Text mr={2} textStyle="textBig" color="gray.900">
                Report for:
              </Text>
              <Text textStyle="textBig" color="gray.900">
                {AddressData.address}
              </Text>
            </Box>
            <Share />
          </Box>
        </Card>
      </Collapse>
      <HStack
        justifyContent="center"
        alignItems="stretch"
        flexDirection={{ base: "column", md: "row" }}
        mb="16px"
        py={5}
        px={{ base: 2, md: 10, lg: 20 }}
        spacing={{ base: 1, md: 2 }}
      >
        {Hazards.map((hazard) => {
          return <CardHazard key={hazard.id} hazard={hazard} />;
        })}
      </HStack>
    </Box>
  );
};

export default Report;
