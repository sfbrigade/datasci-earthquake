import { Stack, Text, Icon } from "@chakra-ui/react";

type KeyElemProps = {
  name: string;
  color: string;
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
        fontWeight="700"
        whiteSpace={"nowrap"}
      >
        {name}
      </Text>
    </Stack>
  );
};
