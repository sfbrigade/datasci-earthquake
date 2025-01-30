"use client";

import React from "react";
import { Flex } from "@chakra-ui/react";

interface FlexColumnProps {
  children: React.ReactNode;
}

const FlexColumn: React.FC<FlexColumnProps> = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  return <Flex direction="column">{children}</Flex>;
};

export default FlexColumn;
