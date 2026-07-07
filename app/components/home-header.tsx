"use client";

import { Suspense, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Headings } from "../data/data";
import NextLink from "@/components/custom-next-link";
import {
  Box,
  Text,
  HStack,
  VisuallyHidden,
  Link,
  Flex,
} from "@chakra-ui/react";
import NextImage from "next/image";

import Heading from "./heading";
import ReportAddress from "./report-address";
// import Share from "./share";
import ShareSkeleton from "./share-skeleton";

export type HazardData = {
  liquefaction: { exists: boolean; last_updated: string | null } | null;
  softStory: { exists: boolean; last_updated: string | null } | null;
  tsunami: { exists: boolean; last_updated: string | null } | null;
};

export type Route = { label: string; href: string };

export const ROUTES = {
  MAP_RISK: { label: "Map & Risks", href: "/" },
  PREPARE: { label: "Prepare", href: "/prepare-v2" },
  ABOUT_US: { label: "About Us", href: "/about-us" },
} as const;

const NAV_LINKS: Route[] = [ROUTES.MAP_RISK, ROUTES.PREPARE, ROUTES.ABOUT_US];

interface HomeHeaderProps {
  searchedAddress: string | null;
  isSearchComplete: boolean;
  onHomeIconClick: () => void;
  activeNav?: keyof typeof ROUTES;
  // onNavChange?: (section: keyof typeof ROUTES) => void;
  children: React.ReactNode;
}

const HomeHeader = ({
  searchedAddress,
  isSearchComplete,
  onHomeIconClick,
  activeNav = "MAP_RISK",
  // onNavChange,
  children,
}: HomeHeaderProps) => {
  const headingData = Headings.home;
  const router = useRouter();
  const [currentNav, setCurrentNav] = useState<keyof typeof ROUTES>(activeNav);
  const pathname = usePathname();
  const handleNavClick = (section: keyof typeof ROUTES) => {
    setCurrentNav(section);
    // onNavChange?.(section);
  };

  return (
    <Box as="header" bgGradient="blue" py={{ base: "2", "2xl": "3" }} px="8">
      {/* Single row: Heading/Address + Search + Nav links + Logo */}
      <Flex
        direction={{ base: "column-reverse", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", lg: "center" }}
        gap={{ base: "2", lg: "4" }}
      >
        {/* Left side: Heading/Address + Search box + nav menu*/}
        <Flex
          direction={{ base: "column", md: "row" }}
          alignItems={{ base: "flex-start", md: "center" }}
          gap={{ base: "2", md: "4" }}
          flex="1"
        >
          <Box hideBelow="xl" flexShrink={0}>
            {isSearchComplete ? (
              <ReportAddress searchedAddress={searchedAddress} />
            ) : (
              <Heading headingData={headingData} />
            )}
          </Box>

          <Flex
            alignItems="center"
            gap="2"
            width={{ base: "full", md: "auto" }}
            flex={{ md: "1" }}
          >
            <Box width={{ base: "full" }}>{children}</Box>
            {/* {isSearchComplete ? (
              <Suspense fallback={<ShareSkeleton />}>
               <Share /> }
              </Suspense>
            ) : null} */}
          </Flex>
          <HStack as="nav" gap={{ base: "3", md: "5" }} overflowX="auto">
            {NAV_LINKS.map((link) => (
              <NextLink
                key={link.href}
                href={link.href}
                fontSize={{ base: "sm", md: "md" }}
                color={pathname === link.href ? "blueBackground" : "white"}
                backgroundColor={
                  pathname === link.href ? "white" : "transparent"
                }
                fontWeight={pathname === link.href ? "bold" : "normal"}
                borderBottom={
                  pathname === link.href
                    ? "[2px solid white]"
                    : "[2px solid transparent]"
                }
                py="1.5"
                px="2.5"
                borderRadius="md"
                cursor="button"
                textDecoration="none"
                whiteSpace="nowrap"
              >
                {link.label}
              </NextLink>
            ))}
          </HStack>
        </Flex>

        {/* Right side: Logo */}
        <Flex alignItems="center" gap={{ base: "3", md: "5" }} flexShrink={0}>
          <HStack align="start" gap="1" flexShrink={0}>
            <Link
              as={"a"}
              color="white"
              href="/"
              cursor="button"
              textDecoration={"none"}
              onClick={(e) => {
                e.preventDefault();
                onHomeIconClick();
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
        </Flex>
      </Flex>
    </Box>
  );
};

export default HomeHeader;
