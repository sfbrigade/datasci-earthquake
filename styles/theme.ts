import { extendTheme, textDecoration } from "@chakra-ui/react";

const customTheme = extendTheme({
  fonts: {
    heading: "Manrope, sans-serif",
    body: "Inter, sans-serif",
  },
  textStyles: {
    logo: {
      fontSize: ["xl", "xl", "2xl", "2xl", "2xl", "2xl"],
      fontWeight: "300",
      color: "blue",
      fontFamily: "heading",
    },
    headerBig: {
      fontSize: ["4xl", "4xl", "5xl", "5xl", "6xl", "6xl"],
      fontWeight: "300",
      lineHeight: ["40px", "40px", "48px", "48px", "60px", "60px"],
      color: "white",
      fontFamily: "heading",
    },
    headerMedium: {
      fontSize: ["2xl", "2xl", "3xl", "3xl", "3xl", "3xl"],
      fontWeight: "500",
      color: "blue",
      fontFamily: "body",
    },
    headerSmall: {
      fontSize: ["lg", "lg", "lg", "lg", "xl", "xl"],
      fontWeight: "normal",
      color: "white",
      fontFamily: "body",
    },
    textBig: {
      fontSize: "xl",
      fontWeight: "normal",
      color: "blue",
      fontFamily: "body",
    },
    textMedium: {
      fontSize: "md",
      fontWeight: "normal",
      color: "grey.900",
      fontFamily: "body",
    },
    textSmall: {
      fontSize: "xs",
      fontWeight: "normal",
      color: "grey.900",
      fontFamily: "body",
    },
    linkBig: {
      fontSize: "xl",
      fontWeight: "normal",
      color: "blue",
      textDecoration: "underline",
      fontFamily: "body",
    },
  },
  colors: {
    grey: {
      200: "#E2E8F0",
      400: "#A0AEC0",
      600: "#4A5568",
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
