"use client";

import {
  Box,
  HStack,
  Link,
  Image,
  Stack,
  VisuallyHidden,
} from "@chakra-ui/react";
import { useRef } from "react";

const HeaderSkeleton = () => {
  const portalRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box as="header" bg={"gradient.blue"} w="100%">
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
              role="img" // needed for VoiceOver bug: https://bugs.webkit.org/show_bug.cgi?id=216364
              h="28px"
              w="142px"
            />
            <VisuallyHidden>SafeHome</VisuallyHidden>
          </HStack>
        </Link>
        <Box ref={portalRef} id="searchbar-portal" />
      </Stack>
    </Box>
  );
};

export default HeaderSkeleton;
