"use client";

import { Box, HStack, Text, Link } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";

const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Box
      as="header"
      bg="gradient.blue"
      w="100%"
      p={{
        base: "19px 23px 8px 23px",
        md: "26px 27px 14px 26px",
        xl: "29px 127px 13px 127px",
      }}
    >
      <HStack justifyContent="space-between">
        <Link as={NextLink} color="white" href="/">
          <Text textStyle="logo" color="white">
            SF QuakeSafe
          </Text>
        </Link>
        {isHome ? (
          <Link as={NextLink} color="white" href="/about">
            <Text textStyle="textMedium" color="white">
              About
            </Text>
          </Link>
        ) : (
          <Link as={NextLink} color="white" href="/">
            <Text textStyle="textMedium" color="white">
              Back To Home
            </Text>
          </Link>
        )}
      </HStack>
    </Box>
  );
};

export default Header;
