"use client";

import {
  Box,
  HStack,
  Text,
  Link,
  Image,
  VisuallyHidden,
  Flex,
} from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const portalRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      as="header"
      bg={isHome ? undefined : "gradient.blue"}
      w="100%"
      position={isHome ? "absolute" : undefined}
      top={isHome ? "0" : undefined}
      display={isHome ? "none" : undefined}
    >
      <Flex
        direction="row"
        justifyContent={{
          base: "flex-start",
          md: "flex-end",
          lg: "flex-end",
          xl: "flex-end",
        }}
        alignItems="center"
        p={{
          base: 6,
          md: 7,
          lg: [7, 8, 7, 8],
          xl: [7, 9, 7, 9],
        }}
      >
        <HStack align="start" gap="1">
          <Link
            as={"a"}
            color="white"
            href="/"
            textDecoration={"none"}
            onClick={(e) => {
              e.preventDefault();
              router.push("/");
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
      </Flex>
    </Box>
  );
};

export default Header;
