import { Box, HStack, Text, Link } from "@chakra-ui/react";
import NextLink from "next/link";

const Header = () => {
  return (
    <Box
      as="header"
      w={{ base: "base", xl: "xl" }}
      p={{
        base: "19px 23px 8px 23px",
        md: "26px 27px 14px 26px",
        xl: "29px 127px 13px 127px",
      }}
    >
      <HStack justifyContent="space-between">
        <Link as={NextLink} color="blue" href="/">
          <Text textStyle="logo">SF QuakeSafe</Text>
        </Link>
        <Link as={NextLink} color="blue" href="/about">
          <Text textStyle="textMedium" color="blue">
            About
          </Text>
        </Link>
      </HStack>
    </Box>
  );
};

export default Header;
