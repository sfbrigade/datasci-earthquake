import AddressMapper from "./components/address-mapper";
import {
  Flex,
  HStack,
  Heading,
  List,
  Box,
  Text,
  Link,
  Image,
} from "@chakra-ui/react";
import NextLink from "next/link";

const HomeSkeleton = () => {
  return (
    <Flex direction="column">
      <AddressMapper />
      <Flex w="full" py="8" px="16" justifyContent="space-between" gap="11">
        <HStack alignItems={"start"} w={{ base: "full", lg: "3/4" }}>
          <div>
            <Heading as="h2">
              <Text
                as="span"
                textStyle="headerBig"
                layerStyle="headerMain"
                color="blue.text"
                fontWeight="light"
              >
                How to be
                <br />
                earthquake-ready
              </Text>
            </Heading>
            <Text as="p" mt="2" textStyle="textBig" layerStyle="text">
              Whether you’re a renter, homeowner, or property manager, these
              resources can help you make confident, informed decisions around
              earthquake safety.
            </Text>
            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Know the lingo
              </Text>
            </Heading>
            <Text as="p" mt="2">
              You’ve seen words like “soft story” and “retrofit” floating
              around, but what do they actually mean?
            </Text>

            <List.Root textStyle="textMedium" layerStyle="text" mt="2">
              <List.Item>
                A{" "}
                <Text as="span" textStyle="textSemibold">
                  soft story
                </Text>{" "}
                building is a structure that contains an open-floor (or “soft”)
                level, such as a garage or retail space, below one or more
                living spaces.
              </List.Item>
              <List.Item>
                <Text as="span" textStyle="textSemibold">
                  Earthquake retrofitting
                </Text>{" "}
                is the process of strengthening a building to make it safer in
                an earthquake, such as adding structural reinforcements or
                upgrading the foundation to better withstand shaking.
              </List.Item>
              <List.Item>
                San Francisco’s{" "}
                <Text as="span" textStyle="textSemibold">
                  Mandatory Soft Story Retrofit Ordinance
                </Text>
                , enacted in 2013, requires all multi-unit soft story buildings
                built before 1978 to be retrofitted in order to minimize the
                risk of earthquake damage. Soft-story homes with 1 to 4 units
                are still vulnerable to earthquake damage, even though the
                ordinance does not legally require them to be retrofitted.
              </List.Item>
            </List.Root>

            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Plan ahead
              </Text>
            </Heading>
            <Text as="p" mt="2">
              These quick and easy steps will help you stay safe during future
              earthquakes.
            </Text>

            <List.Root textStyle="textMedium" layerStyle="text" mt="2">
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.ready.gov/earthquakes"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn how to protect yourself
                </Link>{" "}
                in an earthquake.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.ready.gov/kit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Prep your emergency kit
                </Link>{" "}
                with first aid supplies, batteries, and other essentials.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://myshake.berkeley.edu/"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Download the MyShake app
                </Link>{" "}
                to get early warnings when an earthquake is detected.
              </List.Item>
            </List.Root>

            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Find retrofitting services (if applicable)
              </Text>
            </Heading>
            <Text as="p" mt="2">
              If you own a building in need of retrofitting, the following
              resources can help you get started.
            </Text>

            <List.Root textStyle="textMedium" layerStyle="text" mt="2">
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ess-retrofit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn more
                </Link>{" "}
                about what’s involved in a seismic retrofit.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/resources/find-a-contractor/"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Find a licensed contractor
                </Link>{" "}
                who can perform the right updates to your home.
              </List.Item>
              <List.Item>
                Check your eligibility for an{" "}
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ebb-retrofit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Earthquake Brace and Bolt
                </Link>{" "}
                grant or{" "}
                <Link
                  as={NextLink}
                  href="https://www.californiaresidentialmitigationprogram.com/our-seismic-retrofit-programs/the-retrofits/ess-retrofit"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Earthquake Soft-Story
                </Link>{" "}
                retrofit grant.
              </List.Item>
            </List.Root>

            <Heading as="h3" mt="4">
              <Text as="span" textStyle="headerMedium" layerStyle="headerAlt">
                Know your renters’ rights
              </Text>
            </Heading>
            <Text as="p" mt="2">
              If you’re a renter in a non-compliant building, liquefaction area,
              or tsunami zone, you may want to look into these additional
              resources.
            </Text>
            <List.Root textStyle="textMedium" layerStyle="text" mt="2">
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://www.earthquakeauthority.com/california-earthquake-insurance-policies/renters"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Search for renters earthquake insurance
                </Link>{" "}
                to cover your personal belongings.
              </List.Item>
              <List.Item>
                <Link
                  as={NextLink}
                  href="https://sftu.org/repairs/"
                  textDecoration="underline"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Learn about your right
                </Link>{" "}
                to report unsafe living conditions.
              </List.Item>
            </List.Root>
          </div>
          <Box flexShrink={0} display={{ base: "none", lg: "block" }}>
            <Image
              src="/images/earthquake-ready.png"
              alt="about us"
              width="earthquakeReadyImageWidth"
              height="earthquakeReadyImageHeight"
            />
            {/* TODO: should this be a NextImage or a Chakra Image? */}{" "}
          </Box>
        </HStack>
      </Flex>
    </Flex>
  );
};

export default HomeSkeleton;
