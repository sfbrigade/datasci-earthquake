"use client";

import { Box, HStack } from "@chakra-ui/react";
import CardInfo from "./card-info";
import { Info } from "../data/data";

const Information = () => {
  return (
    <Box>
      <HStack
        justifyContent="space-between"
        alignItems={{ base: "stretch" }}
        flexDirection={{ base: "column", md: "row" }}
        gap="15px"
      >
        {Info.map((infoItem) => {
          return <CardInfo key={infoItem.id} info={infoItem} />;
        })}
      </HStack>
    </Box>
  );
};

export default Information;
