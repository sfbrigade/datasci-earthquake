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
import { FaCircle, FaSquareFull, FaPlus } from "react-icons/fa";
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
    />
  ) : (
    ""
  );
  return (
    <Box>
      <Flex align="center" gap="2">
        <Icon size="sm" color={iconColor}>
          {icon === "circle" ? <FaCircle /> : <FaSquareFull />}
        </Icon>
        <Text fontWeight="medium" color="blue.500" textDecoration="underline">
          {title}
        </Text>
      </Flex>
      <Box w="full"> {hazardPill}</Box>
    </Box>
  );
};
export default CardHazardSummary;
