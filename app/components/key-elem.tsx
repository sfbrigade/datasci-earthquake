import { Box, Stack, Text, Icon, SystemStyleObject } from "@chakra-ui/react";
import { HazardLegendKind } from "../data/hazard-map-config";

type LegendSymbolProps = {
  kind: HazardLegendKind;
};

const LegendSymbol = ({ kind }: LegendSymbolProps) => {
  const size = {
    base: "4",
    md: "5",
  } as const;

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
          bg="grey.400"
          border="softStoryLegend"
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
          borderRadius="sm"
          bgColor="liquefaction.background"
          border="md"
          borderColor="liquefaction.border"
          boxShadow="liquefaction"
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
          borderRadius="sm"
          backgroundImage="tsunamiHatch"
          backgroundRepeat="repeat"
          backgroundSize="16px 16px"
          backgroundColor="tsunami/40"
          border="sm"
          borderColor="tsunami/35"
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
          borderRadius="sm"
          backgroundColor="white"
          backgroundImage="fema"
          border="sm"
          borderColor="femaRisk.veryHigh"
          backgroundClip="padding-box"
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
