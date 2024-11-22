import { Box, Text } from "@chakra-ui/react";
import { AddressData } from "./__mocks__/address-data";

const Pill = () => {
  const getBgColor = (status: string) => {
    switch (status) {
      case "No data":
        return "gray.400";
      case "Compliant":
        return "green";
      case "Non-compliant":
        return "red";
      default:
        return "gray.400";
    }
  };

  return (
    <Box>
      <Text
        bgColor={getBgColor(AddressData.softStory)}
        color="white"
        p="2px 12px 2px 12px"
        borderRadius="25"
      >
        {AddressData.softStory}
      </Text>
    </Box>
  );
};

export default Pill;
