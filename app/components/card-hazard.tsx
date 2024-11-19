import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  HStack,
} from "@chakra-ui/react";
import { Hazards } from "./__mocks__/hazards";
import Pill from "./pill";

const CardHazard = () => {
  const hazard = Hazards[0];

  return (
    <Card maxW={332}>
      <CardHeader p="22px 22px 0px 22px">
        <HStack justifyContent="space-between">
          <Text textStyle="textBig">{hazard.title}</Text>
          <Pill />
        </HStack>
      </CardHeader>
      <CardBody p="14px 22px 0px 22px">
        <Text textStyle="textMedium">{hazard.description}</Text>
      </CardBody>
      <CardFooter p="14px 22px 22px 22px">
        <HStack>
          <svg width="19" height="18" viewBox="0 0 19 18" fill="none">
            <circle
              cx="9.5"
              cy="9"
              r="8.5"
              fill={hazard.color}
              stroke="white"
            />
          </svg>
          <Text textStyle="textSmall">{"Updated " + hazard.update}</Text>
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default CardHazard;
