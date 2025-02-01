import { Box, Card, Collapse, Text } from "@chakra-ui/react";
import { AddressData } from "./__mocks__/address-data";
import Share from "./share";

export const AddressBar = () => {
  return (
    <Collapse in={!!AddressData.address}>
      <Box
        w="100%"
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        mb="16px"
        gap="0"
        backgroundColor="white"
        p={{
          base: "10px 24px 16px 24px",
          md: "10px 27px 16px 26px",
          xl: "10px 128px 16px 127px",
        }}
        borderRadius={0}
      >
        <Box
          display="flex"
          flexDirection="row"
          justifyContent="flex-start"
          width="100%"
        >
          <Text textStyle="textBig" color="gray.900">
            Report for:
          </Text>
          <Text textStyle="textBig" color="gray.900">
            {AddressData.address}
          </Text>
          <Share />
        </Box>
      </Box>
    </Collapse>
  );
};
