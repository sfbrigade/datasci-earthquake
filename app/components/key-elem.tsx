import { Stack, Text, Icon } from "@chakra-ui/react";
import { Dispatch, SetStateAction } from "react";
import { ToggledLayersProps } from "./address-mapper";

type KeyElemProps = {
  name: string;
  color: string;
  icon: React.ReactNode;
  toggleKey: string;
  toggleState: boolean;
  toggledLayers: ToggledLayersProps;
  setToggledLayers: Dispatch<SetStateAction<ToggledLayersProps>>;
};

export const KeyElem = ({
  name,
  color,
  icon,
  toggleKey,
  toggleState,
  toggledLayers,
  setToggledLayers,
}: KeyElemProps) => {
  function handleClick() {
    // preforms first update/setter for address-mapper's state. Its purpose is to set toggleKey's value to the state's name property (toggledLayers.name) and "pass it" to the map component. As the context changes, a useEffect hook runs a function handling the map layer toggling logic in the map component.
    setToggledLayers({
      name: toggleKey,
      softStoryToggled: toggledLayers.softStoryToggled,
      liquefactionToggled: toggledLayers.liquefactionToggled,
      tsunamiToggled: toggledLayers.tsunamiToggled,
    });
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
