import { extendTheme } from "@chakra-ui/react";

const customTheme = extendTheme({
  fonts: {
    body: "Inter, sans-serif",
    heading: "Inter, sans-serif",
  },
  textStyles: {
    logo: {
      fontSize: ["xl", "xl", "2xl", "2xl", "2xl", "2xl"],
      fontWeight: "bold",
      color: "blue",
    },
    headerBig: {
      fontSize: ["4xl", "4xl", "5xl", "5xl", "6xl", "6xl"],
      fontWeight: "normal",
      color: "white",
    },
    headerMedium: {
      fontSize: ["2xl", "2xl", "3xl", "3xl", "3xl", "3xl"],
      fontWeight: "bold",
      color: "blue",
    },
    headerSmall: {
      fontSize: ["lg", "lg", "lg", "lg", "xl", "xl"],
      fontWeight: "bold",
      color: "white",
    },
    textMedium: {
      fontSize: "md",
      fontWeight: "normal",
      color: "grey.900",
    },
    textSmall: {
      fontSize: "xs",
      fontWeight: "normal",
      color: "grey.900",
    },
  },
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
    xl: "1280px",
  },
  breakpoints: {
    base: "0px",
    sm: "375px",
    md: "744px",
    lg: "992px",
    xl: "1280px",
    "2xl": "1536px",
  },
});

export default customTheme;
