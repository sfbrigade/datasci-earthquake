"use client";

import {
  Box,
  HStack,
  Text,
  Link,
  VisuallyHidden,
  Flex,
} from "@chakra-ui/react";
import { usePathname, useRouter } from "next/navigation";
import { useRef } from "react";
import NextImage from "next/image";

const Header = () => {
  const pathname = usePathname();
  const router = useRouter();
  const isHome = pathname === "/";
  const portalRef = useRef<HTMLDivElement | null>(null);

  return (
    <Box
      as="header"
      bgGradient={isHome ? undefined : "blue"}
      w="full"
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
        py={{ base: "6", md: "7" }}
        px={{ base: "6", md: "7", lg: "8", xl: "9" }}
      >
        <HStack align="start" gap="1">
          <Link
            as={"a"}
            color="white"
            href="/"
            textDecoration={"none"}
            onClick={(e) => {
              e.preventDefault();
              // TODO: persist params other than address ones by only removing address, lon, lat
              router.push("/");
            }}
          >
            <HStack align="baseline">
              <NextImage
                width={142} // 619 real width?
                height={28} // 122 real height?
                alt="SafeHome logo"
                role="img" // needed for VoiceOver bug for SVGs: https://bugs.webkit.org/show_bug.cgi?id=216364
                src="/images/SFSafeHome-fulllogo.svg"
                priority
              />
              <VisuallyHidden>SafeHome</VisuallyHidden>
            </HStack>
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
