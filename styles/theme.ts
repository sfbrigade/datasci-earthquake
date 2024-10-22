import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  colors: {
    primary: {
      blue: "#2C5282",
    },
  },
  space: {
    12: "128px",
    4: "24px",
    2: "12px",
  },
  sizes: {
    base: "100%",
    sm: "375px",
    md: "744px",
    lg: "1280px",
  },
  breakpoints: {
    base: "0px",
    sm: "375px",
    md: "744px",
    lg: "1280px",
  },
});

export default customTheme;
