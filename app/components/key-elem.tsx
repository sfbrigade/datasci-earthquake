import { Stack, Text, Icon } from "@chakra-ui/react";

type KeyElemProps = {
  name: string;
  color: string;
  icon: React.ReactNode;
};

export const KeyElem = ({ name, color, icon }: KeyElemProps) => {
  return (
    <Stack direction="row" alignItems="center">
      {/* size was originally sm */}
      <Icon size="md" color={color}>
        {icon}
      </Icon>
      {/* originally had no change to fontWeight property and the property layerStyle="text" */}
      <Text textStyle="textMedium" layerStyle="headerAlt" fontWeight="700">
        {name}
      </Text>
    </Stack>
  );
};
