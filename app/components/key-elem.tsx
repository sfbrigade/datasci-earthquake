import { Stack, Text, Icon } from "@chakra-ui/react";
import { useContext } from "react";
import { LegendClickedContext } from "./legend-clicked-context";

export const KeyElem = ({
  name,
  color,
  icon,
  toggleKey,
  toggleState,
}: {
  name: string;
  color: string;
  icon: React.ReactNode;
  toggleKey: string;
  toggleState: boolean;
}) => {
  const { updateLegendClicked } = useContext(LegendClickedContext);

  function handleClick() {
    // preforms first update/setter for context, only using first argument. Its purpose is to set toggleKey's value to the context's name property (legendClicked.name) and "pass it" to the map component. As the context changes, a useEffect hook runs a function handling the map layer toggling logic in the map component.
    updateLegendClicked(toggleKey);
  }

  return (
    <Stack
      direction="row"
      alignItems="center"
      cursor={"pointer"}
      userSelect={"none"}
      onClick={handleClick}
    >
      <Icon
        size="sm"
        color={color}
        opacity={
          // each instance of a keyElem has a unique toggleState, so this ternary allows individual function of each keyElem.
          toggleState ? 0.5 : 1
        }
      >
        {icon}
      </Icon>
      <Text
        textStyle="textMedium"
        layerStyle="text"
        opacity={
          // each instance of a keyElem has a unique toggleState, so this ternary allows individual function of each keyElem.
          toggleState ? 0.5 : 1
        }
      >
        {name}
      </Text>
    </Stack>
  );
};
