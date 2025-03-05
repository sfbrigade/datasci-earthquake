import { extendTheme, textDecoration } from "@chakra-ui/react";

const customTheme = extendTheme({
  fonts: {
    body: "Manrope, sans-serif",
    heading: "Manrope, sans-serif",
  },
  textStyles: {
    logo: {
      fontSize: ["xl", "xl", "2xl", "2xl", "2xl", "2xl"],
      fontWeight: "normal",
      color: "blue",
    },
    headerBig: {
      fontSize: ["4xl", "4xl", "5xl", "5xl", "6xl", "6xl"],
      fontWeight: "normal",
      lineHeight: ["40px", "40px", "48px", "48px", "60px", "60px"],
      color: "white",
    },
    headerMedium: {
      fontSize: ["2xl", "2xl", "3xl", "3xl", "3xl", "3xl"],
      fontWeight: "bold",
      color: "blue",
    },
    headerSmall: {
      fontSize: ["lg", "lg", "lg", "lg", "xl", "xl"],
      fontWeight: "normal",
      color: "white",
    },
    textBig: {
      fontSize: "xl",
      fontWeight: "bold",
      color: "blue",
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
    linkBig: {
      fontSize: "xl",
      fontWeight: "normal",
      color: "blue",
      textDecoration: "underline",
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
    lightBlue: "#3182CE",
    tsunamiBlue: "#63B3ED",
    yellow: "#ECC94B",
    red: "#C53030",
    green: "#25855A",
    orange: "#F6AD55",
    pink: "#ED64A6",
    gradient: {
      blue: "radial-gradient(120% 180% at 17.81% 82.6%, rgba(59,98,148,1) 0%, rgba(24,50,82,1) 100%);",
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
