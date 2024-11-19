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
      <CardHeader
        p={{
          base: "10px 23px 0px 23px",
          md: "17px 16px 0px 16px",
          xl: "22px 22px 0px 22px",
        }}
      >
        <HStack justifyContent="space-between">
          <Text textStyle="textBig">{hazard.title}</Text>
          <Pill />
        </HStack>
      </CardHeader>
      <CardBody
        p={{
          base: "10px 23px 0px 23px",
          md: "17px 16px 0px 16px",
          xl: "14px 22px 0px 22px",
        }}
      >
        <Text textStyle="textMedium">{hazard.description}</Text>
      </CardBody>
      <CardFooter
        p={{
          base: "10px 23px 10px 23px",
          md: "17px 16px 17px 16px",
          xl: "14px 22px 22px 22px",
        }}
      >
        <HStack>
          <svg width="19" height="18" viewBox="0 0 19 18" fill="none">
            <circle
              cx="9.5"
              cy="9"
              r="8.5"
              fill={hazard.color}
              stroke="white"
              role="img"
            />
          </svg>
          <Text textStyle="textSmall">{"Updated " + hazard.update}</Text>
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default CardHazard;
