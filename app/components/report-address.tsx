import { Stack, Text } from "@chakra-ui/react";

interface ReportAddressProps {
  searchedAddress: string;
}

const ReportAddress: React.FC<ReportAddressProps> = ({ searchedAddress }) => {
  return (
    <Stack
      // border={"1px solid pink"}
      // gap={"9px"}
      direction={{ base: "row", xl: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      gap={{ base: 1, md: 1 }} // TODO FIXME: double check if this should be "9px", as commented out above
    >
      <Text
        textStyle="headerReport"
        layerStyle="headerMain"
        fontSize="3xl"
        // fontWeight={{ base: "bold" }}
        // border={"1px solid orange"}
        // p={"0"}
      >
        Report for {searchedAddress}
      </Text>
      {/* <Text
        textStyle="headerReport"
        layerStyle="headerMain"
        fontSize={{ base: "2xl" }}
        // border={"1px solid lightblue"}
      >
        {searchedAddress}
      </Text> */}
    </Stack>
  );
};

export default ReportAddress;
