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

const Report = ({ searchedAddress }: { searchedAddress: string }) => {
  return (
    <Center flexDirection="column">
      <Collapse
        endingHeight="64px"
        in={searchedAddress.length > 0}
        style={{ overflow: "visible" }}
      >
        <Card
          w="100vw"
          py={2}
          borderBottomWidth="1px"
          borderColor="rgba(0, 0, 0, 0.3)"
          display="flex"
          justifyContent="center"
          alignItems="center"
        >
          <Stack
            w={{ base: "95%", xl: "1100px" }}
            direction={{ base: "column", sm: "row" }}
            alignItems="center"
            justifyContent={{
              base: "space-between",
              xl: "flex-end",
            }}
            position="relative"
            px={{ base: 0, md: 2 }}
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
        </Card>
      </Collapse>
      <Box
        w="100vw"
        py={2}
        borderBottomWidth="1px"
        borderColor="rgba(0, 0, 0, 0.3)"
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
            name="Tsunami Zone"
            color="tsunamiBlue"
            icon={<FaSquareFull />}
          />
        </Stack>
      </Box>
      <CardContainer>
        {Hazards.map((hazard) => {
          return <CardHazard key={hazard.id} hazard={hazard} />;
        })}
      </CardContainer>
    </Center>
  );
};

export default Report;
