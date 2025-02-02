import { Text, HStack } from "@chakra-ui/react";
import Pill from "./pill";
import { BaseCard } from "./base-card";

interface CardHazardProps {
  hazard: {
    id: number;
    name: string;
    title: string;
    description: string;
    update: string;
    color: string;
  };
}

const CardHazard: React.FC<CardHazardProps> = ({
  hazard: { title, name, description, update, color },
}) => {
  const cardProps = {
    header: (
      <HStack>
        <svg width="19" height="18" viewBox="0 0 19 18" fill="none">
          <circle
            cx="9.5"
            cy="9"
            r="8.5"
            fill={color}
            stroke="white"
            role="img"
          />
        </svg>
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
        <Pill name={name} />
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
