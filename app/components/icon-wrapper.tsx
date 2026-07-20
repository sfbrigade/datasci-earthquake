import {
  Square,
  Icon as ChakraIcon,
  type IconProps as ChakraIconProps,
} from "@chakra-ui/react";
import type { IconType } from "react-icons";

type IconColor = ChakraIconProps["color"];

interface IconWrapperProps {
  icon: IconType;
  iconSize?: ChakraIconProps["size"];
  bg?: IconColor;
  color?: IconColor;
}

export function IconWrapper({
  icon: Icon,
  iconSize = "md",
  bg = "blue.50",
  color = "blue.700",
}: IconWrapperProps) {
  return (
    <Square
      size="fit"
      p="1"
      borderRadius="sm"
      backgroundColor={bg}
      color={color}
      flexShrink="0"
      alignSelf="flex-start"
    >
      <ChakraIcon size={iconSize} asChild>
        <Icon aria-hidden="true" focusable="false" />
      </ChakraIcon>
    </Square>
  );
}
