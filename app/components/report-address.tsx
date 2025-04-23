import { Stack, Text } from "@chakra-ui/react"

interface ReportAddressProps {
  searchedAddress: string;
}

const ReportAddress: React.FC<ReportAddressProps> = ({searchedAddress}) => {
  return (
    <Stack
      pt={"24px"}
      direction={{ base: "column", md: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      spacing={{ base: 0, md: 1 }}
      >
      <Text
        textStyle="headerReport"
      >
        Report for
      </Text>
      <Text
        textStyle="headerReport"
      >
        {searchedAddress}
      </Text>
    </Stack>
  )
}

export default ReportAddress;

