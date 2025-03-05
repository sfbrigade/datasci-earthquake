import {
  Flex,
  Link,
  Text,
  Box,
  VStack,
  HStack,
  UnorderedList,
  ListItem,
} from "@chakra-ui/react";
import Heading from "../components/heading";
import { Headings } from "../data/data";
import NextLink from "next/link";
import Image from "next/image";

const About = () => {
  const headingData = Headings.about;
  return (
    <Flex
      w={{ base: "base", xl: "xl" }}
      p={{
        base: "23px 24px 16px 24px",
        md: "37px 27px 16px 26px",
        xl: "50px 128px 16px 127px",
      }}
      m="auto"
      gap="46px"
    >
      <Flex direction="column" alignItems={"flex-start"} gap="60px">
        <Heading headingData={headingData} />
        <Text textStyle="textBig" color="black">
          Seismologists predict a 72% probability that the Bay Area will
          experience a magnitude 6.7 (or greater) earthquake in the next 30
          years. SafeHome was created to give San Franciscans the knowledge and
          confidence to feel safe in an earthquake of any size. Using public
          data from the City of San Francisco, our user-friendly tools help you
          understand your home’s seismic stability and take practical steps to
          stay prepared.
        </Text>
        <VStack>
          <Text textStyle="headerMedium" alignSelf="flex-start">
            Supporting a citywide mission
          </Text>
          <Text textStyle="textMedium">
            We’re working with city leaders to support San Francisco&apos;s
            efforts efforts to make buildings safer and more resilient against
            earthquakes. In particular, our goal is to help raise awareness
            around high-risk residential buildings—such as soft story buildings
            that haven’t been retrofitted, and older concrete structures—and to
            provide easily accessible tools to help you make informed decisions
            earthquake safety.
          </Text>
        </VStack>
        <VStack alignItems="flex-start">
          <Text textStyle="headerMedium">Methodology and data sources</Text>
          <Text textStyle="textMedium">
            SafeHome uses up-to-date official public datasets to power the maps
            and information displayed to users. Our technologists and data
            scientists have rigorously analyzed the Soft Story Properties
            dataset, which includes compliance tiers and statuses for soft-story
            buildings, defined as structures with wood-frame structures
            containing five or more residential units and having two or more
            stories over a soft&quot; or weak&quot; story. We’ve also compiled
            publicly available data to visualize other earthquake-related
            hazards, such as liquefaction and tsunami zones.
          </Text>
          <Text textStyle="textMedium">
            For more information on the data, please visit:
          </Text>
          <UnorderedList>
            <ListItem>
              <Link
                as={NextLink}
                color="black"
                href="https://data.sfgov.org/Housing-and-Buildings/Soft-Story-Properties/beah-shgi/about_data"
                textDecoration="underline"
              >
                Soft Story Dataset
              </Link>
            </ListItem>
            <ListItem>
              <Link
                as={NextLink}
                color="black"
                href="https://data.sfgov.org/Geographic-Locations-and-Boundaries/Soil-Liquefaction-Hazard-Zone/i4t7-35u3/about_data"
                textDecoration="underline"
              >
                Liquefaction Dataset
              </Link>
            </ListItem>
            <ListItem>
              <Link
                as={NextLink}
                color="black"
                href="https://www.conservation.ca.gov/cgs/tsunami/maps"
                textDecoration="underline"
              >
                Tsunami Dataset
              </Link>
            </ListItem>
          </UnorderedList>
          <Text textStyle="textMedium">
            For details on the City of San Francisco’s seismic compliance
            requirements, see{" "}
            <Link
              as={NextLink}
              color="black"
              href="https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_building/0-0-0-88754"
              textDecoration="underline"
            >
              Section 504E
            </Link>{" "}
            of the San Francisco Building Inspection Commission Code.
          </Text>
        </VStack>
      </Flex>
      <Box flexShrink={0}>
        <Image
          src="/images/UserCartoon.png"
          alt="about us"
          width="280"
          height="280"
        />
      </Box>
    </Flex>
  );
};

export default About;
