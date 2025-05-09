"use client";

import { Box, HStack, Text, Link, Image, Stack } from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useRef } from "react";

const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAbout = pathname === "/About";
  const portalRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      as="header"
      bg={isHome ? undefined : "gradient.blue"}
      w="100%"
      position={isHome ? "absolute" : undefined}
      top={isHome ? "0" : undefined}
    >
      <Stack
        direction={{ base: "column", md: "row" }}
        w={{ base: "full", xl: "7xl" }}
        h="112px"
        justifyContent="flex-start"
        columnGap="25px"
        m="auto"
        p={{
          base: "18px 24px 18px 24px",
          md: "28px 28px 28px 28px",
          xl: "28px 128px 28px 128px",
        }}
      >
        <Link
          as={"a"}
          color="white"
          href="/"
          textDecoration={"none"}
          onClick={(e) => {
            e.preventDefault();
            window.location.href = "/";
          }}
        >
          <HStack align="baseline">
            <Image
              src="/images/SFSafeHome-fulllogo.svg"
              alt="SafeHome logo"
              color="white"
              h="28px"
              w="142px"
            />
            <Text textStyle="logo">SafeHome</Text>
          </HStack>
        </Link>
        {isHome && <Box ref={portalRef} id="searchbar-portal" />}
        {isAbout && (
          <Link as={NextLink} color="white" href="/">
            <Text textStyle="textMedium" color="white">
              Back To Home
            </Text>
          </Link>
        )}
      </Stack>
    </Box>
  );
};

export default Header;
