"use client";

import React from "react";
import {
  Box,
  Flex,
  Skeleton,
  SkeletonText,
  Stack,
  HStack,
  Link,
  Image,
  VisuallyHidden,
  Text,
} from "@chakra-ui/react";
import NextLink from "next/link";

const HeaderSkeleton = () => {
  return (
    <Box as="header" bg="gradient.blue" w="100%" top="0" pb="212px">
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
        <HStack align="start" gap="1">
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

        {/* {isHome && <Box ref={portalRef} id="searchbar-portal" />}
          {isAbout && (
            <Link as={NextLink} color="white" href="/">
              <Text textStyle="textMedium" layerStyle="text" color="white">
                Back To Home
              </Text>
            </Link>
          )} */}
      </Stack>
    </Box>
  );
};

// const BodySkeletonTemplate = (props) => {
//   return (
//     <>
//       <Skeleton height={props.title_h} width={props.title_w} variant="shine" />
//       <Skeleton height={props.sub_title_h} width={props.sub_title_w} variant="shine" />
//       <SkeletonText height={props.ul_h} width={props.ul_w} variant="shine" noOfLines={props.lines} />
//     </>
//   );
// };

const HomeSkeleton = () => {
  return (
    <Flex direction="column">
      <HeaderSkeleton />
      <Skeleton height="1012px" width="100%" variant="shine" />
      <Flex
        w={{ base: "full", xl: "7xl" }}
        p={{
          base: "24px 24px 24px 24px",
          md: "36px 28px 16px 28px",
          xl: "96px 128px 96px 128px",
        }}
        m="auto"
        gap="46px"
      >
        <HStack alignItems={"start"}>
          <Box flex="1">
            <Stack gap={2.5} mb="10px">
              <Skeleton height="70px" width="300px" variant="shine" />
              <Skeleton height="60px" width="500px" variant="shine" />
              <SkeletonText
                height="25px"
                width="712px"
                variant="shine"
                noOfLines={3}
              />
              <Skeleton height="40px" width="240px" mt="1" variant="shine" />
              <Skeleton height="35px" width="680px" mt="1" variant="shine" />
              <SkeletonText
                height="18px"
                width="690px"
                variant="shine"
                noOfLines={8}
              />
              <Skeleton height="40px" width="180px" mt="1" variant="shine" />
              <Skeleton height="20px" width="580px" mt="1" variant="shine" />
              <SkeletonText
                height="18px"
                width="660px"
                variant="shine"
                noOfLines={3}
              />
              <Skeleton height="40px" width="520px" mt="1" variant="shine" />
              <Skeleton height="20px" width="700px" mt="1" variant="shine" />
              <SkeletonText
                height="18px"
                width="670px"
                variant="shine"
                noOfLines={3}
              />
              <Skeleton height="40px" width="350px" mt="1" variant="shine" />
              <Skeleton height="40px" width="710px" mt="1" variant="shine" />
              <SkeletonText
                height="18px"
                width="580px"
                variant="shine"
                noOfLines={2}
              />
            </Stack>
          </Box>
        </HStack>
        <Box display={{ base: "none", lg: "block" }}>
          <Skeleton height="290px" width="300px" ml="-30px" variant="shine" />
        </Box>
      </Flex>
    </Flex>
  );
};

export default HomeSkeleton;
