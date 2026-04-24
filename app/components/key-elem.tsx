import { Stack, Text, Icon } from "@chakra-ui/react";

export const KeyElem = ({
  name,
  color,
  icon,
}: {
  name: string;
  color: string;
  icon: React.ReactNode;
}) => {
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
