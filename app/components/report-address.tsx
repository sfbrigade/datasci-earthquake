import { Stack, Text } from "@chakra-ui/react"

interface ReportAddressProps {
  searchedAddress: string;
}

const ReportAddress: React.FC<ReportAddressProps> = ({searchedAddress}) => {
  return (
    <Stack
      direction={{ base: "column", md: "row" }}
      alignItems={{ base: "flex-start", md: "center" }}
      spacing={{ base: 0, md: 1 }}
      >
      <Text
        textStyle="headerSmall"
        fontWeight="normal"
        fontSize="22px"
        color="gray.900"
      >
        Report for:
      </Text>
      <Text
        textStyle="headerMedium"
        fontWeight="normal"
        color="gray.900"
        pb="4px"
      >
        {searchedAddress}
      </Text>
    </Stack>
  )
}

export default ReportAddress;

