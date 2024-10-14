import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  colors: {
    grey: {
      200: "#E2E8F0",
      400: "#A0AEC0",
      900: "#171923",
    },
    white: "#FFF",
    blue: "#2C5282",
    yellow: "#ECC94B",
    red: "#E53E3E",
    green: "#25855A",
    orange: "#F6AD55",
    pink: "#ED64A6",
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
