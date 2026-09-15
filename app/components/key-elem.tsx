import {
  Box,
  Stack,
  Text,
  Icon,
  SystemStyleObject,
} from "@chakra-ui/react";
import { HazardLegendKind } from "../data/hazard-map-config";

type LegendSymbolProps = {
  kind: HazardLegendKind;
};

const LegendSymbol = ({ kind }: LegendSymbolProps) => {
  const size = { base: "4", md: "5" };

  switch (kind) {
    case "softStory":
      return (
        <Box
          data-testid="hazard-legend-softStory"
          aria-hidden="true"
          w={size}
          h={size}
          flexShrink={0}
          borderRadius="full"
          bg="#A0AEC0"
          border="1px solid white"
        />
      );

    case "liquefaction":
      return (
        <Box
          data-testid="hazard-legend-liquefaction"
          aria-hidden="true"
          w={size}
          h={size}
          flexShrink={0}
          borderRadius="2px"
          bg="rgba(246, 173, 85, 0.08)"
          border="2px solid #C05621"
          boxShadow="inset 0 0 0 3px rgba(246, 173, 85, 0.35)"
        />
      );

    case "tsunami":
      return (
        <Box
          data-testid="hazard-legend-tsunami"
          aria-hidden="true"
          w={size}
          h={size}
          flexShrink={0}
          borderRadius="2px"
          backgroundImage="url('/images/tsunami-hatch-fine-16.png')"
          backgroundRepeat="repeat"
          backgroundSize="16px 16px"
          border="1px solid rgba(43, 108, 176, 0.35)"
        />
      );

    case "femaRisk":
      return (
        <Box
          data-testid="hazard-legend-femaRisk"
          aria-hidden="true"
          w={size}
          h={size}
          flexShrink={0}
          borderRadius="2px"
          backgroundImage={`linear-gradient(
            to right,
            #440154 0%,
            #440154 25%,
            #31688E 25%,
            #31688E 50%,
            #35B779 50%,
            #35B779 75%,
            #FDE725 75%,
            #FDE725 100%
          )`}
          border="1px solid rgba(0, 0, 0, 0.15)"
        />
      );
  }
};

type KeyElemProps = {
  name: string;
  legend?: HazardLegendKind;
  color?: SystemStyleObject["color"];
  icon?: React.ReactNode;
};

export const KeyElem = ({ name, legend, color, icon }: KeyElemProps) => {
  return (
    <Stack direction="row" alignItems="center">
      {legend ? (
        <LegendSymbol kind={legend} />
      ) : icon ? (
        <Icon size={{ base: "sm", md: "md" }} color={color}>
          {icon}
        </Icon>
      ) : null}
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
