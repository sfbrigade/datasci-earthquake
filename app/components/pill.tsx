import { Box, Color, Text, Tokens } from "@chakra-ui/react";

interface PillProps {
  exists: boolean | undefined;
  trueData: string | string[];
  falseData: string;
  noData: string;
  variant?: "pill" | "reverse";
  pillBackgroundColor?: Tokens["colors"]; // optional prop to set the background color of the pill
}

const Pill: React.FC<PillProps> = ({
  exists,
  trueData,
  falseData,
  noData,
  variant = "pill",
  pillBackgroundColor,
}) => {
  const getColor = () => {
    if (pillBackgroundColor) {
      return pillBackgroundColor;
    }
    switch (exists) {
      case true:
        return "orange.600/90";
      case false:
        return "green";
      default:
        return "muted";
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

  return (
    <Box>
      <Text
        bgColor={variant === "reverse" ? pillBackgroundColor : color}
        color={variant === "reverse" ? "black" : "white"}
        py="0.5"
        px="3"
        borderRadius="full"
        border={variant === "reverse" ? "xs" : "none"}
        borderColor={variant === "reverse" ? "black" : "transparent"}
        whiteSpace={"nowrap"}
      >
        {label}
      </Text>
    </Box>
  );
};

export default Pill;
