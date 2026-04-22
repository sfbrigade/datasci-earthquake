import { Stack, Text, Icon, SystemStyleObject } from "@chakra-ui/react";

type KeyElemProps = {
  name: string;
  color: SystemStyleObject["color"];
  icon: React.ReactNode;
};

export const KeyElem = ({ name, color, icon }: KeyElemProps) => {
  return (
    <Stack direction="row" alignItems="center">
      <Icon boxSize={{ base: "sm", md: "md" }} color={color}>
        {icon}
      </Icon>
      <Text
        textStyle={{ base: "textSmall", md: "textMedium" }}
        layerStyle="headerAlt"
        fontWeight="bold"
        whiteSpace={"nowrap"}
      >
        {name}
      </Text>
    </Stack>
  );
};
