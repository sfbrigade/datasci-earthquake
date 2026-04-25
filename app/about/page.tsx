import {
  Flex,
  Link,
  Text,
  Box,
  VStack,
  List,
  Collapsible,
  HStack,
} from "@chakra-ui/react";
import Heading from "../components/heading";
import {
  Headings,
  DataInfoLinks,
  TeamMembers,
  InactiveTeamMembers,
} from "../data/data";
import NextLink from "../components/custom-next-link";
import NextImage from "next/image";
import { LuChevronRight } from "react-icons/lu";

const About = () => {
  const headingData = Headings.about;

  const buildInfoLinks = () => {
    return DataInfoLinks.map((dataInfolink) => {
      return (
        <List.Item key={dataInfolink.id}>
          {buildLink(dataInfolink.url, dataInfolink.label)}
        </List.Item>
      );
    });
  };

  const buildLink = (url: string, label: string) => {
    return (
      <Link as={NextLink} color="black" href={url} textDecoration="underline">
        {label}
      </Link>
    );
  };

  const buildTeamMembers = () => {
    return TeamMembers.map((teamMember, index) => {
      return (
        <List.Item key={teamMember.user_id} mb="1">
          <Text>
            <Text as="span" fontWeight="extrabold">
              {teamMember.name}
              {" - "}
            </Text>
            {teamMember.role}
          </Text>
        </List.Item>
      );
    });
  };

  const buildInactiveTeamMembers = () => {
    return InactiveTeamMembers.map((teamMember, index, array) => {
      return (
        <Text key={teamMember.user_id} display="inline">
          <Text as="span" fontWeight="semibold" display="inline">
            {teamMember.name}
          </Text>
          <Text as="span" fontWeight="light" display="inline">
            {` - ${teamMember.role}${index < array.length - 1 ? ", " : ""}`}
          </Text>
        </Text>
      );
    });
  };

  return (
    <Flex
      w={{ base: "full", xl: "7xl" }}
      py="8"
      pb="12"
      px={{ base: "8", xl: "32" }}
      gap="11"
      direction={{ base: "column", lg: "row" }}
      m="auto"
    >
      <Flex direction="column" alignItems={"flex-start"} gap="12">
        <Heading headingData={headingData} />
        <Text textStyle="textBig" layerStyle="text">
          Seismologists predict a 72% probability that the Bay Area will
          experience a magnitude 6.7 (or greater) earthquake in the next 30
          years. SafeHome was created to give San Franciscans the knowledge and
          confidence to feel safe in an earthquake of any size. Using public
          data from the City of San Francisco, our user-friendly tools help you
          understand your home’s seismic stability and take practical steps to
          stay prepared.
        </Text>
        <VStack>
          <Text
            textStyle="headerMedium"
            layerStyle="headerAlt"
            alignSelf="flex-start"
          >
            Supporting a citywide mission
          </Text>
          <Text textStyle="textMedium" layerStyle="text">
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
          <Text textStyle="headerMedium" layerStyle="headerAlt">
            Methodology and data sources
          </Text>
          <Text textStyle="textMedium" layerStyle="text">
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
          <Text textStyle="textMedium" layerStyle="text">
            For more information on the data, please visit:
          </Text>
          <List.Root>{buildInfoLinks()}</List.Root>
          <Text textStyle="textMedium" layerStyle="text">
            For details on the City of San Francisco’s seismic compliance
            requirements, see{" "}
            {buildLink(
              "https://codelibrary.amlegal.com/codes/san_francisco/latest/sf_building/0-0-0-88754",
              "Section 504E"
            )}{" "}
            of the San Francisco Building Inspection Commission Code.
          </Text>
        </VStack>
        {/* TODO: group team members by team, at least for active team members, and make this look nicer */}
        <VStack alignItems="flex-start">
          <Text textStyle="headerMedium" layerStyle="headerAlt">
            Meet the team
          </Text>
          <Text textStyle="textMedium" layerStyle="text">
            SafeHome is run by a volunteer team at{" "}
            {buildLink("https://www.sfcivictech.org/about/", "SF Civic Tech")},
            a diverse group of technologists, creatives, and data scientists
            building tools to help communities access important services and
            solve local challenges.
          </Text>
          <List.Root listStyleType="none" mb="10">
            {buildTeamMembers()}
          </List.Root>
          <Collapsible.Root mb="10" collapsedHeight="100px">
            <Collapsible.Trigger cursor="button">
              <HStack>
                <Text textStyle="headerSmall" layerStyle="headerAlt">
                  Thank you to past team members
                </Text>
                <Collapsible.Indicator _open={{ transform: "rotate(90deg)" }}>
                  <LuChevronRight />
                </Collapsible.Indicator>
              </HStack>
            </Collapsible.Trigger>
            <Collapsible.Content
              _closed={{
                maskImage:
                  "linear-gradient(to bottom, black 75%, transparent 100%)",
              }}
            >
              {buildInactiveTeamMembers()}
            </Collapsible.Content>
          </Collapsible.Root>

          <Text>
            <Text as="span" fontWeight="extrabold">
              Interested in joining SF Civic Tech?
            </Text>{" "}
            Whether you’re into coding, design, research, or just want to help
            out, there’s a place for you here.{" "}
            {buildLink("https://www.sfcivictech.org/get-started/", "Join us")}{" "}
            to make a difference or explore other civic tech projects helping
            our city thrive!
          </Text>
          <Text>
            <Text as="span" fontWeight="extrabold">
              Have a question or feedback about SafeHome?
            </Text>{" "}
            You can get in touch with us at{" "}
            {buildLink("mailto:hello@sfcivictech.org", "hello@sfcivictech.org")}
            . Friendly reminder: our team is run entirely by volunteers and it
            may take some time to direct your message to the right folks! We’ll
            do our best to get back to you as soon as we can.
          </Text>
        </VStack>
      </Flex>
      <Box flexShrink={0}>
        <NextImage
          width={304}
          height={282}
          alt="Illustration of person at their desk in front of a laptop and wearing headphones"
          src="/images/UserCartoon.png"
        />
      </Box>
    </Flex>
  );
};

export default About;
