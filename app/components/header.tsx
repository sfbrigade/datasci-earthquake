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
        w={{ base: "base", xl: "xl" }}
        h="114px"
        justifyContent="flex-start"
        columnGap="25px"
        m="auto"
        p={{
          base: "19px 23px 8px 23px",
          md: "26px 26px 14px 26px",
          xl: "29px 127px 13px 127px",
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
              src="/images/SFSafeHome-logo.svg"
              alt="Logo"
              color="white"
              boxSize={{
                base: "22px",
                md: "28px",
              }}
            />
            <Text textStyle="logo" color="white">
              SafeHome
            </Text>
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
