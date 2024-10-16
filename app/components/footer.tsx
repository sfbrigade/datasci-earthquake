import { Box, Text } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      w={{ base: "base", xl: "xl" }}
      p={{
        base: "19px 23px 8px 23px",
        md: "26px 27px 14px 26px",
        xl: "29px 127px 13px 127px",
      }}
    >
      <Box border="1px solid" borderColor="grey.400">
        <Text textStyle="textSmall">Logo</Text>
      </Box>
    </Box>
  );
};

export default Footer;
