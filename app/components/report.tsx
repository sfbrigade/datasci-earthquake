import { Box, HStack } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { Hazards } from "../data/data";

const Report = () => {
  return (
    <Box>
      <HStack
        justifyContent="center"
        alignItems="stretch"
        flexDirection={{ base: "column", md: "row" }}
        mb="16px"
        py={5}
        px={{ base: 2, md: 20 }}
        spacing={{ base: 1, md: 2 }}
      >
        {Hazards.map((hazard) => {
          return <CardHazard key={hazard.id} hazard={hazard} />;
        })}
      </HStack>
    </Box>
  );
};

export default Report;
