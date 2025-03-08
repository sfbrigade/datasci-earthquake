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
      <Icon fontSize="16px" color={color} viewBox="0 0 16 16">
        {icon}
      </Icon>
      <Text textStyle="textMedium">{name}</Text>
    </Stack>
  );
};
