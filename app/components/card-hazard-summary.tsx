import {
  Box,
  Flex,
  Text,
  Icon,
  Card,
  Image,
  SystemStyleObject,
  Spinner,
} from "@chakra-ui/react";
import { PillData } from "../data/data";
import Pill from "./pill";
interface CardHazardSummaryProps {
  address: string;
  hazard: {
    id: number;
    name: string;
    title: string;
    description: string;
    info: string[];
    link: { label: string; url: string };
    icon: string;
    iconColor: SystemStyleObject["color"];
  };
  hazardData?: { exists?: boolean; last_updated?: string };
  showData: boolean;
  isHazardDataLoading: boolean;
  toggledStates: boolean[];
}
const CardHazardSummary: React.FC<CardHazardSummaryProps> = ({
  address,
  hazard,
  hazardData,
  showData,
  isHazardDataLoading,
}) => {
  if (!hazard) return null;
  const { id, title, name, description, icon, iconColor } = hazard;
  const { exists, last_updated: date } = hazardData || {};
  const pillTextOptions = PillData.find((object) => object.name === name) ?? {
    trueData: "No Data",
    falseData: "No Data",
    noData: "No Data",
  };
  const hazardPill = isHazardDataLoading ? (
    <Spinner size="xs" />
  ) : showData ? (
    <Pill
      exists={exists}
      trueData={pillTextOptions.trueData}
      falseData={pillTextOptions.falseData}
      noData={pillTextOptions.noData}
      variant="text"
    />
  ) : (
    ""
  );
  return (
    <Card.Root maxW="sm">
      <Card.Body gap="2">
        <Card.Title mt="2">{address}</Card.Title>
        <Card.Description>{hazardPill}</Card.Description>
      </Card.Body>
    </Card.Root>
  );
};
export default CardHazardSummary;
