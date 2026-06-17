"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { Headings } from "../data/data";
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

export type NavSection = "map-risk" | "prepare" | "data" | "about-us";

const NAV_LINKS: { label: string; value: NavSection }[] = [
  { label: "Map & Risk", value: "map-risk" },
  { label: "Prepare", value: "prepare" },
  { label: "Data", value: "data" },
  { label: "About Us", value: "about-us" },
];

interface HomeHeaderProps {
  searchedAddress: string | null;
  isSearchComplete: boolean;
  onHomeIconClick: () => void;
  activeNav?: NavSection;
  onNavChange?: (section: NavSection) => void;
  children: React.ReactNode;
}

const HomeHeader = ({
  searchedAddress,
  isSearchComplete,
  onHomeIconClick,
  activeNav = "map-risk",
  onNavChange,
  children,
}: HomeHeaderProps) => {
  const headingData = Headings.home;
  const router = useRouter();
  const [currentNav, setCurrentNav] = useState<NavSection>(activeNav);

  const handleNavClick = (section: NavSection) => {
    setCurrentNav(section);
    onNavChange?.(section);
  };

  return (
    <Box as="header" bgGradient="blue" py={{ base: "2", "2xl": "3" }} px="8">
      {/* Single row: Heading/Address + Search + Nav links + Logo */}
      <Flex
        direction={{ base: "column", lg: "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", lg: "center" }}
        gap={{ base: "2", lg: "4" }}
      >
        {/* Left side: Heading/Address + Search box */}
        <Flex
          direction={{ base: "column", md: "row" }}
          alignItems={{ base: "flex-start", md: "center" }}
          gap={{ base: "2", md: "4" }}
          flex="1"
        >
          <Box flexShrink={0}>
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
        </Flex>

        {/* Right side: Nav links + Logo */}
        <Flex alignItems="center" gap={{ base: "3", md: "5" }} flexShrink={0}>
          <HStack as="nav" gap={{ base: "3", md: "5" }} overflowX="auto">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.value}
                as="button"
                color="white"
                fontSize={{ base: "sm", md: "md" }}
                fontWeight={currentNav === link.value ? "bold" : "normal"}
                borderBottom={
                  currentNav === link.value
                    ? "[2px solid white]"
                    : "[2px solid transparent]"
                }
                pb="1"
                cursor="button"
                textDecoration="none"
                whiteSpace="nowrap"
                onClick={() => handleNavClick(link.value)}
              >
                {link.label}
              </Link>
            ))}
          </HStack>

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
