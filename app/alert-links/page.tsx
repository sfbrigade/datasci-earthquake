import "../globals.css";
import { Heading, Text, List, Flex } from "@chakra-ui/react";
import Link from "next/link";

const AlertLinks = () => {
  return (
    <Flex
      direction="column"
      w={{ base: "full", xl: "7xl" }}
      p={{
        base: "24px 24px 24px 24px",
        md: "36px 28px 16px 28px",
        xl: "96px 128px 96px 128px",
      }}
      m="auto"
      gap="0px"
    >
      <Heading as="h2">
        <Text
          as="span"
          textStyle="headerBig"
          layerStyle="headerMain"
          color="blue"
          fontWeight="300"
        >
          Earthquake alerts
        </Text>
      </Heading>
      <List.Root textStyle="textMedium" layerStyle="list">
        <List.Item>
          <Link
            href="https://myshake.berkeley.edu/"
            style={{ textDecoration: "underline" }}
            target="_blank"
            rel="noopener noreferrer"
          >
            Download the MyShake app
          </Link>{" "}
          to get early warnings when an earthquake is detected.
        </List.Item>
      </List.Root>
      <Heading as="h2">
        <Text
          as="span"
          textStyle="headerBig"
          layerStyle="headerMain"
          color="blue"
          fontWeight="300"
        >
          General emergency information
        </Text>
        <List.Root textStyle="textMedium" layerStyle="list">
          <List.Item>
            <Link
              href="https://member.everbridge.net/453003085612609/new"
              style={{ textDecoration: "underline" }}
              target="_blank"
              rel="noopener noreferrer"
            >
              Sign up for AlertSF
            </Link>{" "}
            for information during natural disasters and other significant
            events.
          </List.Item>
        </List.Root>
      </Heading>
    </Flex>
  );
};

export default AlertLinks;
