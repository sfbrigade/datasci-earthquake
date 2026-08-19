"use client";

import { usePathname, useRouter } from "next/navigation";
import {
  Box,
  Text,
  HStack,
  VisuallyHidden,
  Link,
  Flex,
} from "@chakra-ui/react";
import NextImage from "next/image";

import { Headings } from "../data/data";
import NextLink from "@/components/custom-next-link";
import Heading from "./heading";
import ReportAddress from "./report-address";

export type Route = {
  label: string;
  href: string;
};

export const ROUTES = {
  MAP_RISK: {
    label: "Map & Risks",
    href: "/",
  },
  PREPARE: {
    label: "Prepare",
    href: "/prepare",
  },
  ABOUT_US: {
    label: "About Us",
    href: "/about",
  },
} as const;

const NAV_LINKS: Route[] = [ROUTES.MAP_RISK, ROUTES.PREPARE, ROUTES.ABOUT_US];

interface HomeHeaderProps {
  searchedAddress: string | null;
  isSearchComplete: boolean;
  onHomeIconClick: () => void;
  queryString?: string;
  children: React.ReactNode;
}

const HomeHeader = ({
  searchedAddress,
  isSearchComplete,
  onHomeIconClick,
  queryString = "",
  children,
}: HomeHeaderProps) => {
  const headingData = Headings.home;
  const router = useRouter();
  const pathname = usePathname();

  const getNavigationHref = (href: string) => {
    if (!queryString) {
      return href;
    }

    return `${href}?${queryString}`;
  };

  return (
    <Box
      as="header"
      bgGradient="blue"
      py={{ base: "2", "2xl": "3" }}
      px="6"
      w="full"
    >
      <Flex
        direction={{ base: "column-reverse", "2xl": "row" }}
        justifyContent="space-between"
        alignItems={{ base: "flex-start", "2xl": "center" }}
        gap={{ base: "2", "2xl": "4" }}
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
            {/* TODO: add share button back in once we have a working share component /* }
            {/* {isSearchComplete ? (
              <Suspense fallback={<ShareSkeleton />}>
               <Share /> }
              </Suspense>
            ) : null} */}
          </Flex>

          <HStack as="nav" gap={{ base: "3", md: "5" }} overflowX="auto">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href;

              return (
                <NextLink
                  key={link.href}
                  href={getNavigationHref(link.href)}
                  fontSize={{ base: "sm", md: "md" }}
                  color={isActive ? "blueBackground" : "white"}
                  backgroundColor={isActive ? "white" : "transparent"}
                  fontWeight={isActive ? "bold" : "normal"}
                  borderBottom={
                    isActive ? "[2px solid white]" : "[2px solid transparent]"
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
              );
            })}
          </HStack>
        </Flex>

        {/* Right side: Logo */}
        <Flex alignItems="center" gap={{ base: "3", md: "5" }} flexShrink={0}>
          <HStack align="start" gap="1" flexShrink={0}>
            <Link
              as="a"
              color="white"
              href="/"
              cursor="button"
              textDecoration="none"
              onClick={(event) => {
                event.preventDefault();
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
