import { Box, Card, Collapse, HStack, Text } from "@chakra-ui/react";
import { AddressData } from "./__mocks__/address-data";
import Share from "./share";

export const AddressBar = () => {
  return (
    <Collapse in={!!AddressData.address}>
      <Card w="100%" mb="16px" gap="0" px={20} pt={5} pb={2} borderRadius={0}>
        <Box
          display="flex"
          flexDirection={{ base: "column", md: "row" }}
          alignItems="center"
          justifyContent={{
            base: "flex-end",
            lg: "center",
          }}
          width="100%"
          position="relative"
        >
          <HStack
            position={{ base: "relative", md: "absolute" }}
            left={0}
            spacing={1}
            direction="row"
            mb={{ base: "5px", md: 0 }}
          >
            <Text textStyle="textBig" color="gray.900">
              Report for:
            </Text>
            <Text textStyle="textBig" color="gray.900">
              {AddressData.address}
            </Text>
          </HStack>
          <Share />
        </Box>
      </Card>
    </Collapse>
  );
};
