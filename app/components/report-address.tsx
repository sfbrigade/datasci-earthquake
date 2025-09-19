import { Stack, Text } from "@chakra-ui/react";

interface ReportAddressProps {
  searchedAddress: string | null;
}

const ReportAddress: React.FC<ReportAddressProps> = ({ searchedAddress }) => {
  return (
    <Stack
      direction={{ base: "row", xl: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      gap={{ base: 1, md: 1 }} // TODO FIXME: double check if this should be "9px", as commented out above
    >
      <Text textStyle="headerMedium" layerStyle="headerMain" fontSize="3xl">
        Report for {searchedAddress}
      </Text>
    </Stack>
  );
};

export default ReportAddress;
