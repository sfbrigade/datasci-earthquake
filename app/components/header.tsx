import { Box } from "@chakra-ui/react";

const Header = () => {
  return (
    <Box
      w={{ base: "base", lg: "lg" }}
      p={{
        base: "19px 23px 8px 23px",
        md: "26px 27px 14px 26px",
        lg: "29px 127px 13px 127px",
      }}
    >
      <Box border="1px solid grey">Header</Box>
    </Box>
  );
};

export default Header;
