import {
  Text,
  HStack,
  VStack,
  Link,
  Card,
  Spinner,
  Popover,
} from "@chakra-ui/react";
import Pill from "./pill";
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
  isHazardDataLoading: boolean;
}

const CardHazard: React.FC<CardHazardProps> = ({
  hazard,
  hazardData,
  showData,
  isHazardDataLoading,
}) => {
  const { title, name, description } = hazard;
  const { exists, last_updated: date } = hazardData || {};

  const hazardPill = isHazardDataLoading ? (
    <Spinner size="xs" />
  ) : showData ? (
    <Pill exists={exists} />
  ) : (
    ""
  );

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
    <Card.Root flex={1} maxW={400} p={{ base: "16px", md: "20px" }}>
      <Popover.Root
        placement="bottom"
        returnFocusOnClose={false}
        closeOnBlur={true}
        aria-label={`${hazard.title} information`}
      >
        <Popover.Trigger>
          <VStack cursor={"pointer"} alignItems={"flex-start"} h={"100%"}>
            <Card.Header p={0}>
              <Text textStyle="cardTitle" fontWeight={"700"}>
                {title}
              </Text>
            </Card.Header>
            <Card.Body p={0} mb={"14px"}>
              <Text textStyle="textMedium">{description}</Text>
            </Card.Body>
            <Card.Footer p={0} width={"100%"}>
              <HStack justifyContent="space-between" width="100%">
                <Text cursor={"pointer"} textDecoration={"underline"}>
                  More Info
                </Text>
                {hazardPill}
              </HStack>
            </Card.Footer>
          </VStack>
        </Popover.Trigger>
        <Popover.Positioner>
          <Popover.Content>
            <Popover.CloseTrigger />
            <Popover.Arrow>
              <Popover.ArrowTip />
            </Popover.Arrow>
            <Popover.Body mt="5" w="348px">
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
            </Popover.Body>
          </Popover.Content>
        </Popover.Positioner>
      </Popover.Root>
    </Card.Root>
  );
};

export default CardHazard;
