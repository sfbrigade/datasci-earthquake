import { Box, HStack } from "@chakra-ui/react";
import CardHazard from "./card-hazard";
import { Hazards } from "../data/data";

const Report = () => {
  const sharedStyles = {
    px: { base: 3, md: 5, lg: 10 },
  };

  return (
    <Box>
      <HStack
        justifyContent="space-between"
        alignItems="stretch"
        flexDirection={{ base: "column", md: "row" }}
        mb="16px"
        py={5}
        {...sharedStyles}
      >
        {Hazards.map((hazard) => {
          return <CardHazard key={hazard.id} hazard={hazard} />;
        })}
      </HStack>
    </Box>
  );
};

export default Report;
