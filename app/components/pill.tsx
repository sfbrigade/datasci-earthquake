import { Box, Text } from "@chakra-ui/react";

interface PillProps {
  exists: boolean | undefined;
  trueData: string;
  falseData: string;
  noData: string;
  variant?: "pill" | "text";
}

const Pill: React.FC<PillProps> = ({
  exists,
  trueData,
  falseData,
  noData,
  variant = "pill",
}) => {
  const getColor = () => {
    switch (exists) {
      case true:
        return "red";
      case false:
        return "green";
      default:
        return "lightGrey";
    }
  };
  const color = getColor();

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
  const label = getLabel();

  if (variant === "text") {
    return (
      <Box display="inline-block" color={color}>
        {label}
      </Box>
    );
  }

  return (
    <Box>
      <Text
        bgColor={color}
        color="white"
        py="0.5"
        px="3"
        borderRadius="full"
        whiteSpace={"nowrap"}
      >
        {label}
      </Text>
    </Box>
  );
};

export default Pill;
