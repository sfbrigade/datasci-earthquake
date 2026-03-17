import {
  Box,
  Flex,
  Text,
  Icon,
  Separator,
  Link,
  Accordion,
  AccordionRoot,
  AccordionItem,
  AccordionItemTrigger,
  AccordionItemIndicator,
  AccordionItemContent,
  SystemStyleObject,
  Spinner,
} from "@chakra-ui/react";
import { PillData, LayerIds } from "../data/data";
import { FaCircle, FaSquareFull } from "react-icons/fa";
import Pill from "./pill";
import { Dispatch, SetStateAction, useState } from "react";
import { LayerToggleObjProps } from "./address-mapper";
interface CardRiskProps {
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
  setToggledStates: Dispatch<SetStateAction<boolean[]>>;
  setLayerToggleObj: Dispatch<SetStateAction<LayerToggleObjProps>>;
}

const CardRisk: React.FC<CardRiskProps> = ({
  hazard,
  hazardData,
  showData,
  isHazardDataLoading,
}) => {
  const { id, title, name, description, icon, iconColor } = hazard;
  const { exists, last_updated: date } = hazardData || {};
  const pillTextOptions = PillData.find((object) => object.name === name) ?? {
    trueData: "No Data",
    falseData: "No Data",
    noData: "No Data",
  };
  const [isMoreInfo, setIsMoreInfo] = useState(false);
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
  console.log("PillData", PillData);
  return (
    <Box borderWidth="0.25" borderRadius="lg" p="5">
      <AccordionRoot collapsible defaultValue={["risk"]}>
        <AccordionItem value="risk">
          <AccordionItemTrigger>
            <Flex justify="space-between" w="full">
              <Flex align="center" gap="4">
                <Icon size="lg" color={iconColor}>
                  {icon === "circle" ? <FaCircle /> : <FaSquareFull />}
                </Icon>
                <Text fontWeight="semibold">
                  {title} — {hazardPill}
                </Text>
              </Flex>
            </Flex>
            <AccordionItemIndicator />
          </AccordionItemTrigger>

          <AccordionItemContent>
            <Text fontSize="sm" mt="2">
              {description}
            </Text>

            <Separator my="4" />

            <Text fontSize="sm">
              Soft story buildings that haven’t been reinforced may be at risk
              in an earthquake. <Link color="blue.500">Learn More</Link>
            </Text>

            <Box bg="blue.50" p="4" borderRadius="md" mt="4">
              <Text fontSize="xs" fontWeight="bold" mb="3">
                WHAT YOU CAN STILL DO
              </Text>

              <Box as="ol" pl="4">
                <Box as="li">Download the MyShake app</Box>
                <Box as="li">Prep your emergency kit</Box>
                <Box as="li">Check eligibility for retrofit grant</Box>
              </Box>
            </Box>
          </AccordionItemContent>
        </AccordionItem>
      </AccordionRoot>
    </Box>
  );
};
export default CardRisk;
