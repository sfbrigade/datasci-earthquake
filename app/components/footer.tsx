import { Box, HStack, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      as="footer"
      w="100%"
      p={{
        base: "8px 23px 8px 23px",
        md: "14px 26px 14px 26px",
        xl: "16px 127px 16px 127px",
      }}
    >
      <HStack justifyContent="space-between">
        <Text textStyle="textMedium" color="grey.900">
          © 2024 SF Civic Tech
        </Text>
      </HStack>
    </Box>
  );
};

export default Footer;
