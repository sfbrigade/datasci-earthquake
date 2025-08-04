import { Box, Text } from "@chakra-ui/react";

interface PillProps {
  exists: boolean | undefined;
}

const Pill: React.FC<PillProps> = ({ exists }) => {
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
        return "At Risk";
      case false:
        return "Low Risk";
      default:
        return "No Data";
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
