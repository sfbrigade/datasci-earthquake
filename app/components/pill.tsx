import { Box, Text } from "@chakra-ui/react";

interface PillProps {
  exists: boolean | undefined;
  hazardType: string | undefined;
}

const Pill: React.FC<PillProps> = ({ exists, hazardType }) => {
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
    if (hazardType === "softStory") {
      switch (exists) {
        case true:
          return "Non-Compliant";
        case false:
          return "Compliant";
        default:
          return "No Data";
      }
    }
    if (hazardType === "liquefaction") {
      switch (exists) {
        case true:
          return "High Hazard";
        case false:
          return "low Hazard";
        default:
          return "No Data";
      }
    }
    if (hazardType === "tsunami") {
      switch (exists) {
        case true:
          return "In Zone";
        case false:
          return "Out of Zone";
        default:
          return "No Data";
      }
    }
  };

  return (
    <Box>
      <Text
        bgColor={getColor()}
        color="white"
        p="2px 12px 2px 12px"
        borderRadius="25"
      >
        {getLabel()}
      </Text>
    </Box>
  );
};

export default Pill;
