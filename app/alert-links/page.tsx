import { Heading, Text, List } from "@chakra-ui/react";
import Link from "next/link";

const AlertLinks = () => {
  return (
    <div>
      <Heading as="h2">
        <Text
          as="span"
          textStyle="headerBig"
          layerStyle="headerMain"
          color="blue"
          fontWeight="300"
        >
          Earthquake alerts to sign up for:
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
          </Link>
        </List.Item>
      </List.Root>
    </div>
  );
};

export default AlertLinks;
