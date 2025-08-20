import { Stack, Text, Icon } from "@chakra-ui/react";
import { useState, useContext } from "react";
import { LegendClickedContext } from "./legend-clicked-context";

export const KeyElem = ({
  name,
  color,
  icon,
  toggleValue,
}: {
  name: string;
  color: string;
  icon: React.ReactNode;
  toggleValue: string;
}) => {
  const { legendClicked, updateLegendClicked } =
    useContext(LegendClickedContext);
  const [isClicked, setIsClicked] = useState(false);

  function handleClick() {
    if (legendClicked.name === "") return;
    updateLegendClicked(toggleValue);
    setIsClicked(!isClicked);
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      cursor={"pointer"}
      userSelect={"none"}
      onClick={handleClick}
    >
      <Icon size="sm" color={color} opacity={isClicked ? 0.5 : 1}>
        {icon}
      </Icon>
      <Text
        textStyle="textMedium"
        layerStyle="text"
        opacity={isClicked ? 0.5 : 1}
      >
        {name}
      </Text>
    </Stack>
  );
};
