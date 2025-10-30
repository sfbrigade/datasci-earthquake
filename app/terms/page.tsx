import { Flex, Text, Link, VStack, Box } from "@chakra-ui/react";
import NextLink from "next/link";
import Image from "next/image";

const TermsOfService = () => {
  return (
    <>
      <Flex
        w={{ base: "full", xl: "7xl" }}
        pt={{ base: "6", md: "9", xl: "12" }} // TODO: compare new 6 (24px) to old 23px, new 12 (48px) to old 50px
        pb="12" // TODO: compare new 12 (48px) to old 50px
        px={{ base: "6", md: "7", xl: "32" }} // TODO: compare new 7 (28px) to old 27px and old 26px, new 32 (128px) to old 127px
        gap="11"
        direction={{ base: "column", lg: "row" }}
        m="auto"
      >
        <VStack direction="column" alignItems="flex-start">
          <Text
            textStyle="headerBig"
            layerStyle="headerMain"
            color="blue.text"
            fontWeight="light"
            marginBottom="8"
          >
            Terms of Service
          </Text>
          <Text
            textStyle="headerMedium"
            layerStyle="headerAlt"
            alignSelf="flex-start"
            color="blue.text"
          >
            Acceptable Use
          </Text>
          <VStack gap="8" alignItems="flex-start">
            <Text textStyle="textMedium" layerStyle="text">
              You may view, use, and download information from this website for
              your informational, non-commercial use. The data is NOT suitable
              for: commercial decision-making; financial or investment
              decisions; any official documentation or verification. Users agree
              to independently verify any information before relying on it for
              any important decisions.
            </Text>
            <Text textStyle="textMedium" layerStyle="text">
              The data presented on this website has been collected from
              publicly available sources, and is subject to the inaccuracies of
              those data sources.
            </Text>
            <Text textStyle="textMedium" layerStyle="text">
              No representations or warranties are made regarding the accuracy,
              completeness, or reliability of the data.
            </Text>
            <Text textStyle="textMedium" layerStyle="text">
              Properties not identified as soft-story buildings or located
              within a designated hazard zone are inferred to have a lower risk
              based on public records; however, this does not constitute a
              definitive guarantee of safety. Certain other factors, such as
              buildings built with{" "}
              <Link
                as={NextLink}
                href="https://www.documentcloud.org/documents/23813850-draft-inventory-of-sf-non-ductile-concrete-buildings-march-2023/"
                textDecoration="underline"
                target="_blank"
              >
                non-ductile concrete
              </Link>
              , may also present a hazard and are not indicated on this site.
            </Text>
            <Text textStyle="textMedium" layerStyle="text">
              The data and analysis presented on this website are generated
              through automated processes and methodologies that, while
              carefully designed, may contain errors, inconsistencies, or
              misattributions.
            </Text>
            <Text textStyle="textMedium" layerStyle="text">
              By accessing this website, you acknowledge that the data may
              contain inaccuracies, errors, or outdated information; that
              property hazard connections are inferential and not definitive
              proof of safety risk; that the information should be used only for
              educational and research purposes.
            </Text>
          </VStack>
        </VStack>
        <Box flexShrink={0}>
          <Image
            src="/images/UserCartoon3.png"
            alt="about us"
            width="300"
            height="300"
          />
        </Box>
      </Flex>
    </>
  );
};
export default TermsOfService;
