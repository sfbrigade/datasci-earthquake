import { Box, HStack } from "@chakra-ui/react";
import CardInfo from "./card-info";
import { Info } from "../data/data";
import { info } from "console";

const Information = () => {
  return (
    <Box>
      <HStack
        justifyContent="space-between"
        alignItems={{ base: "flex-start", md: "center" }}
        flexDirection={{ base: "column", md: "row" }}
        mb="16px"
        gap="0"
      >
        {Info.map((infoItem) => {
          return <CardInfo key={infoItem.id} info={infoItem} />;
        })}
      </HStack>
    </Box>
  );
};

export default Information;
