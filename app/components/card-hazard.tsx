import { Text, HStack } from "@chakra-ui/react";
import Pill from "./pill";
import { BaseCard } from "./base-card";

interface CardHazardProps {
  hazard: {
    id: number;
    name: string;
    title: string;
    description: string;
  };
  hazardData?: {
    exists?: boolean;
    last_updated?: string;
  };
}

const CardHazard: React.FC<CardHazardProps> = ({ hazard, hazardData }) => {
  const { title, name, description } = hazard;
  const { exists, last_updated: date } = hazardData || {};

  const cardProps = {
    header: (
      <HStack>
        <Text textStyle="textBig">{title}</Text>
      </HStack>
    ),
    footer: (
      <HStack justifyContent="space-between" width="100%">
        <Text
          cursor="pointer"
          textStyle="textMedium"
          color="lightBlue"
          textDecoration="underline"
        >
          More info
        </Text>
        {exists !== undefined ? <Pill exists={exists} /> : ""}
      </HStack>
    ),
  };

  return (
    <BaseCard {...cardProps}>
      <Text textStyle="textMedium">{description}</Text>
    </BaseCard>
  );
};

export default CardHazard;
