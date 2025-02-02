import { Card, Center, Collapse, Stack, Text } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { Hazards } from "../data/data";
import { AddressData } from "./__mocks__/address-data";
import Share from "./share";
import { CardContainer } from "./card-container";

const Report = () => {
  return (
    <Center flexDirection="column">
      <Collapse in={!!AddressData.address} style={{ overflow: "visible" }}>
        <Card
          w="100vw"
          mb={2}
          py={2}
          borderRadius={0}
          display="flex"
          alignItems="center"
        >
          <Stack
            w={{ base: "95%", xl: "1100px" }}
            direction={{ base: "column", sm: "row" }}
            alignItems="center"
            justifyContent={{
              base: "space-between",
              xl: "center",
            }}
            position="relative"
            px={{ base: 0, md: 2 }}
          >
            <Stack
              position={{ base: "relative", xl: "absolute" }}
              left={{ base: 0, xl: 2 }}
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
                {AddressData.address}
              </Text>
            </Stack>
            <Share />
          </Stack>
        </Card>
      </Collapse>
      <CardContainer>
        {Hazards.map((hazard) => {
          return <CardHazard key={hazard.id} hazard={hazard} />;
        })}
      </CardContainer>
    </Center>
  );
};

export default Report;
