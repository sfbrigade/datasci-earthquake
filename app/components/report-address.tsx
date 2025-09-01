import { Stack, Text } from "@chakra-ui/react";

interface ReportAddressProps {
  searchedAddress: string;
}

const ReportAddress: React.FC<ReportAddressProps> = ({ searchedAddress }) => {
  return (
    <Stack
      // gap={"9px"}
      direction={{ base: "row", md: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      gap={{ base: 0, md: 1 }} // TODO FIXME: double check if this should be "9px", as commented out above
    >
      <Text textStyle="headerReport" layerStyle="headerMain" fontSize={{ base: "xs"}}>
        Report for
      </Text>
     
      <Text textStyle="headerReport" layerStyle="headerMain" fontSize={{ base: "xs"}}>
        {searchedAddress}
      </Text>
    </Stack>
  );
};

export default ReportAddress;
