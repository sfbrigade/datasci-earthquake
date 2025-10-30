import { Stack, Text } from "@chakra-ui/react";

interface ReportAddressProps {
  searchedAddress: string | null;
}

const ReportAddress: React.FC<ReportAddressProps> = ({ searchedAddress }) => {
  return (
    <Stack
      direction={{ base: "row", xl: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      gap={{ base: "1", md: "1" }}
    >
      <Text textStyle="headerMedium" layerStyle="headerMain">
        Report for {searchedAddress}
      </Text>
    </Stack>
  );
};

export default ReportAddress;
