import { Box, Text } from "@chakra-ui/react";
import { AddressData, AddressDataType } from "./__mocks__/address-data";

interface PillProps {
  name: string;
}

const Pill: React.FC<PillProps> = ({ name }) => {
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

  const status = AddressData[name as keyof AddressDataType] || "No data";

  return (
    <Box>
      <Text
        bgColor={getBgColor(status)}
        color="white"
        p="2px 12px 2px 12px"
        borderRadius="25"
      >
        {status}
      </Text>
    </Box>
  );
};

export default Pill;
