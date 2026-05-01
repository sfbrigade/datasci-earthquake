import { Stack, Text, Icon, SystemStyleObject } from "@chakra-ui/react";

type KeyElemProps = {
  name: string;
  color: SystemStyleObject["color"];
  icon: React.ReactNode;
  isMobile?: boolean;
};

export const KeyElem = ({ name, color, icon, isMobile }: KeyElemProps) => {
  return (
    <Stack direction="row" alignItems="center">
      <Icon size={isMobile ? "sm" : "md"} color={color}>
        {icon}
      </Icon>
      <Text
        textStyle={isMobile ? "textSmall" : "textMedium"}
        layerStyle="headerAlt"
        fontWeight="bold"
        whiteSpace={"nowrap"}
      >
        {name}
      </Text>
    </Stack>
  );
};
