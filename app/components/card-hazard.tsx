import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  HStack,
} from "@chakra-ui/react";
import { Hazards } from "./__mocks__/hazards";
import { GoDotFill } from "react-icons/go";

const CardHazard = () => {
  const hazard = Hazards[0];

  return (
    <Card>
      <CardHeader>
        <HStack>
          <Text fontSize="lg" fontWeight="bold">
            {hazard.title}
          </Text>
        </HStack>
      </CardHeader>
      <CardBody>
        <Text>{hazard.description}</Text>
      </CardBody>
      <CardFooter>
        <HStack>
          <GoDotFill color={hazard.color} />
          <Text>{"Updated " + hazard.update}</Text>
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default CardHazard;
