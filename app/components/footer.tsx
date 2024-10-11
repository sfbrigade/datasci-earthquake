import { Box } from "@chakra-ui/react";

const Footer = () => {
  return (
    <Box
      width={{ base: "base", lg: "lg" }}
      padding={{
        base: "19px 23px 8px 23px",
        md: "26px 27px 14px 26px",
        lg: "29px 127px 13px 127px",
      }}
    >
      <Box bgColor="#E2E8F0">This is Footer</Box>
    </Box>
  );
};

export default Footer;
