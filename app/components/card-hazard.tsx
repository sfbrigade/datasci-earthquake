import { Text, HStack, Button, VStack, Link } from "@chakra-ui/react";
import Pill from "./pill";
import { BaseCard } from "./base-card";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
  PopoverBody,
  PopoverArrow,
  PopoverCloseButton,
} from "@chakra-ui/react";

interface CardHazardProps {
  hazard: {
    id: number;
    name: string;
    title: string;
    description: string;
    info: string[];
    link: {
      label: string;
      url: string;
    };
  };
  hazardData?: {
    exists?: boolean;
    last_updated?: string;
  };
}

const CardHazard: React.FC<CardHazardProps> = ({ hazard, hazardData }) => {
  const { title, name, description } = hazard;
  const { exists, last_updated: date } = hazardData || {};

  const buildHazardCardInfo = () => {
    return (
      <VStack gap={5} p={5}>
        {hazard.info.map((infoItem, index) => (
          <Text key={index}>{infoItem}</Text>
        ))}
      </VStack>
    );
  };

  const cardProps = {
    header: (
      <HStack>
        <Text textStyle="textBig">{title}</Text>
      </HStack>
    ),
    footer: (
      <HStack justifyContent="space-between" width="100%">
        <Popover>
          <PopoverTrigger>
            <Text cursor={"pointer"} textDecoration={"underline"} width="100%">
              More Info
            </Text>
          </PopoverTrigger>
          <PopoverContent mt={5} width="348px">
            <PopoverArrow />
            <PopoverCloseButton />
            <PopoverBody>
              {buildHazardCardInfo()}
              <Link
                display={"inline-block"}
                pb={3}
                pl={5}
                href={hazard.link.url}
                target="_blank"
                textDecoration="underline"
              >
                {hazard.link.label}
              </Link>
            </PopoverBody>
          </PopoverContent>
        </Popover>
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
