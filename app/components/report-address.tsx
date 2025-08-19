import { Stack, Text } from "@chakra-ui/react";

interface ReportAddressProps {
  searchedAddress: string;
}

const ReportAddress: React.FC<ReportAddressProps> = ({ searchedAddress }) => {
  return (
    <Stack
      pt={"24px"}
      // gap={"9px"}
      direction={{ base: "column", md: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      gap={{ base: 0, md: 1 }} // TODO FIXME: double check if this should be "9px", as commented out above
    >
      <Text textStyle="headerReport" layerStyle="headerMain">
        Report for
      </Text>
      <Text textStyle="headerReport" layerStyle="headerMain">
        {searchedAddress}
      </Text>
    </Stack>
  );
};

export default ReportAddress;
