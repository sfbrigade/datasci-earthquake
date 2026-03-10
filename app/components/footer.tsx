import { Box, Text, Center } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box as="footer" w="full" bgColor="blueBackground" py="4" px="6">
      <Center>
        <Text textStyle="textXSmall" layerStyle="text" color="white">
          © 2025 SF Civic Tech · Data from City of San Francisco public
          datasets. Not for official or financial use.
        </Text>
      </Center>
    </Box>
  );
};

export default Footer;
