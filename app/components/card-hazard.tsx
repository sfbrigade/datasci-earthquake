import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Text,
  HStack,
  Link,
} from "@chakra-ui/react";
import Pill from "./pill";
import NextLink from "next/link";

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
  return (
    <Card flex={1} maxW={400}>
      <CardHeader
        p={{
          base: "10px 23px 0px 23px",
          md: "17px 16px 0px 16px",
          xl: "22px 22px 0px 22px",
        }}
      >
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
      </CardHeader>
      <CardBody
        p={{
          base: "10px 23px 0px 23px",
          md: "17px 16px 0px 16px",
          xl: "14px 22px 0px 22px",
        }}
      >
        <Text textStyle="textMedium">{description}</Text>
      </CardBody>
      <CardFooter
        p={{
          base: "10px 23px 10px 23px",
          md: "17px 16px 17px 16px",
          xl: "14px 22px 22px 22px",
        }}
      >
        <HStack justifyContent="space-between" width="100%">
          <Link as={NextLink} href="">
            <Text
              textStyle="textMedium"
              color="lightBlue"
              textDecoration="underline"
            >
              More info
            </Text>
          </Link>
          <Pill name={name} />
        </HStack>
      </CardFooter>
    </Card>
  );
};

export default CardHazard;
