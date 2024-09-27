import { Button, Heading, Text } from "@chakra-ui/react";
import Link from "next/link";

const NotFound = () => {
  return (
    <>
      <Heading>404 - Page Not Found</Heading>
      <Text>Sorry, but the page you are looking for does not exist.</Text>
      <Link href="/">
        <Button size="sm" colorScheme="teal">
          Go Back to Home
        </Button>
      </Link>
    </>
  );
};

export default NotFound;
