import { Stack, Text, Icon } from "@chakra-ui/react";

type KeyElemProps = {
  name: string;
  color: string;
  icon: React.ReactNode;
};

export const KeyElem = ({ name, color, icon }: KeyElemProps) => {
  return (
    <Stack direction="row" alignItems="center">
      <Icon size="sm" color={color}>
        {icon}
      </Icon>
      <Text textStyle="textMedium" layerStyle="text">
        {name}
      </Text>
    </Stack>
  );
};
