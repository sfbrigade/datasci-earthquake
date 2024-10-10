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
    sm: "375px",
    md: "744px",
    lg: "1280px",
  },
  breakpoints: {
    sm: "375px",
    md: "744px",
    lg: "1280px",
  },
});

export default customTheme;
