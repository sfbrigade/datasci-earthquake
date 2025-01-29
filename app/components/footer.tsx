"use client";

import { Box, HStack, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      as="footer"
      w={{ base: "base", xl: "xl" }}
      p={{
        base: "19px 23px 8px 23px",
        md: "26px 27px 14px 26px",
        xl: "29px 127px 13px 127px",
      }}
    >
      <HStack justifyContent="space-between">
        <Text textStyle="textSmall" color="grey.900">
          © 2024 SF Civic Tech
        </Text>
      </HStack>
    </Box>
  );
};

export default Footer;
