"use client";

import {
  Box,
  HStack,
  Text,
  Link,
  Image,
  // Stack,
  VisuallyHidden,
  Flex,
} from "@chakra-ui/react";
import { usePathname } from "next/navigation";
import NextLink from "next/link";
import { useRef } from "react";

const Header = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";
  const isAbout = pathname === "/about";
  const portalRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      // border={"5px solid yellow"}
      as="header"
      bg={isHome ? undefined : "gradient.blue"}
      w="100%"
      position={isHome ? "absolute" : undefined}
      top={isHome ? "0" : undefined}
      display={isHome ? "none" : undefined}
    >
      <Flex
        // border={"5px solid red"}
        direction="row"
        // w={{ base: "full", xl: "7xl" }}
        // h="112px"
        justifyContent={{
          base: "flex-start",
          md: "flex-end",
          lg: "flex-end",
          xl: "flex-end",
        }}
        alignItems="center"
        // columnGap="25px"
        // m="auto"
        // p={[10, 20, 30, 200]}
        p={{
          base: 6,
          md: 7,
          lg: [7, 8, 7, 8],
          xl: [7, 9, 7, 9],
        }}
      >
        <HStack align="start" gap="1" 
        // border={"2px solid limegreen"}
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
                role="img" // needed for VoiceOver bug: https://bugs.webkit.org/show_bug.cgi?id=216364
                h="28px"
                w="142px"
              />
              <VisuallyHidden>SafeHome</VisuallyHidden>
            </HStack>{" "}
          </Link>
          <Text textStyle="textPrerelease" layerStyle="prerelease">
            Beta
          </Text>
        </HStack>

        {isHome && <Box ref={portalRef} id="searchbar-portal" />}
        {/* {isAbout && (
          <Link as={NextLink} color="white" href="/">
            <Text textStyle="textMedium" layerStyle="text" color="white">
              Back To Home
            </Text>
          </Link>
        )} */}
      </Flex>
    </Box>
  );
};

export default Header;
