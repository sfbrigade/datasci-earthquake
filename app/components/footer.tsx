"use client";

import { Box, HStack, Text } from "@chakra-ui/react";
import { usePathname } from "next/navigation";

const Footer = () => {
  const pathname = usePathname();
  const isHome = pathname === "/";

  return (
    <Box
      as="footer"
      w="100%"
      position={isHome ? "absolute" : undefined}
      bottom={isHome ? "0" : undefined}
      p={
        isHome
          ? "7px 7px 6px"
          : {
              base: "8px 23px 8px 23px",
              md: "14px 26px 14px 26px",
              xl: "16px 127px 16px 127px",
            }
      }
    >
      <Text
        textStyle="textMedium"
        color="grey.900"
        align={isHome ? "right" : undefined}
        m="auto"
      >
        © 2024 SF Civic Tech
      </Text>
    </Box>
  );
};

export default Footer;
