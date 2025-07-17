import { Box, Text } from "@chakra-ui/react";

interface PillProps {
  exists: boolean | undefined;
  trueData: string | undefined;
  falseData: string | undefined;
  noData: string | undefined;
}

const Pill: React.FC<PillProps> = ({ exists, trueData, falseData, noData }) => {
  const getColor = () => {
    switch (exists) {
      case true:
        return "red";
      case false:
        return "green";
      default:
        return "grey";
    }
  };

  const getLabel = () => {
    switch (exists) {
      case true:
        return trueData;
      case false:
        return falseData;
      default:
        return noData;
    }
  };

  return (
    <Box>
      <Text
        bgColor={getColor()}
        color="white"
        p="2px 12px 2px 12px"
        borderRadius="full"
      >
        {getLabel()}
      </Text>
    </Box>
  );
};

export default Pill;
