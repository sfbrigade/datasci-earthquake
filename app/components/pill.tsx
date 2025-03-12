import { Box, Text } from "@chakra-ui/react";
import { AddressData, AddressDataType } from "./__mocks__/address-data";

interface PillProps {
  exists: boolean | undefined;
}

const Pill: React.FC<PillProps> = ({ exists }) => {
  const color = exists ? "red" : "green";
  const status = exists ? "At Risk" : "Low Risk";

  return (
    <Box>
      <Text
        bgColor={color}
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
