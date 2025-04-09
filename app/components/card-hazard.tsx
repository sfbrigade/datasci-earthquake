import {
  Text,
  HStack,
  Button,
  VStack,
  Link,
  CardFooter,
  CardBody,
  Card,
  CardHeader,
  useDisclosure,
} from "@chakra-ui/react";
import Pill from "./pill";
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
  showData: boolean;
}

const CardHazard: React.FC<CardHazardProps> = ({
  hazard,
  hazardData,
  showData,
}) => {
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

  return (
    <Card flex={1} maxW={400} p={{ base: "16px", md: "20px" }}>
      <Popover
        placement="bottom"
        returnFocusOnClose={false}
        closeOnBlur={true}
        aria-label={`${hazard.title} information`}
      >
        <PopoverTrigger>
          <VStack cursor={"pointer"} alignItems={"flex-start"} h={"100%"}>
            <CardHeader p={0}>
              <Text textStyle="textBig" fontWeight={"700"}>
                {title}
              </Text>
            </CardHeader>
            <CardBody p={0} mb={"14px"}>
              <Text>{description}</Text>
            </CardBody>
            <CardFooter p={0} width={"100%"}>
              <HStack justifyContent="space-between" width="100%">
                <Text cursor={"pointer"} textDecoration={"underline"}>
                  More Info
                </Text>
                {showData ? <Pill exists={exists} /> : ""}
              </HStack>
            </CardFooter>
          </VStack>
        </PopoverTrigger>
        <PopoverContent mt={5} width={"348px"}>
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
    </Card>
  );
};

export default CardHazard;
