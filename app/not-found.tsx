import { Button, Heading, Text } from "@chakra-ui/react";
import NextLink from "./components/custom-next-link";

const NotFound = () => {
  return (
    <>
      <Heading>404 - Page Not Found</Heading>
      <Text>Sorry, but the page you are looking for does not exist.</Text>
      <NextLink href="/">
        f<Button size="sm">Go Back to Home</Button>
      </NextLink>
    </>
  );
};

export default NotFound;
