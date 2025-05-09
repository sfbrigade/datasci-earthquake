import { extendTheme, textDecoration } from "@chakra-ui/react";

const customTheme = extendTheme({
  fonts: {
    heading: "Manrope, sans-serif",
    body: "Inter, sans-serif",
  },
  textStyles: {
    logo: {
      fontSize: "lg",
      fontWeight: "300",
      color: "white",
      fontFamily: "heading",
      textIndent: "-1000em",
    },
    headerBig: {
      fontSize: ["4xl", "4xl", "5xl", "5xl", "6xl", "6xl"],
      fontWeight: "300",
      lineHeight: ["40px", "40px", "48px", "48px", "60px", "60px"],
      color: "white",
      fontFamily: "heading",
    },
    headerReport: {
      fontSize: ["3xl", "3xl", "4xl", "4xl", "4xl", "4xl"],
      fontWeight: "300",
      lineHeight: ["40px", "40px", "48px", "48px", "60px", "60px"],
      color: "white",
      fontFamily: "heading",
    },
    headerMedium: {
      fontSize: ["2xl", "2xl", "3xl", "3xl", "3xl", "3xl"],
      fontWeight: "500",
      color: "blue",
      fontFamily: "heading",
    },
    headerSmall: {
      fontSize: ["lg", "lg", "lg", "lg", "xl", "xl"],
      fontWeight: "normal",
      color: "white",
      fontFamily: "body",
    },
    cardTitle: {
      fontSize: "xl",
      fontWeight: "normal",
      color: "blue",
      fontFamily: "body",
    },
    textBig: {
      fontSize: "xl",
      fontWeight: "normal",
      color: "grey.900",
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
    textSemibold: {
      fontWeight: "600",
    },
  },
  layerStyles: {
    list: {
      listStyleType: "disc",
      paddingLeft: "6",
    },
    listItem: {
      listStyleType: "disc",
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
    blueBackground: "#2C5282", // blue/700
    blue: "#2B6CB0", // blue/600 (TODO: all headings)
    lightBlue: "#3182CE", // blue/500 (TODO: remove)
    tsunamiBlue: "#63B3ED", // blue/300
    yellow: "#ECC94B",
    red: "#C53030",
    green: "#25855A",
    orange: "#F6AD55",
    pink: "#ED64A6",
    gradient: {
      blue: "radial-gradient(120% 180% at 17.81% 82.6%, rgba(59,98,148,1) 0%, rgba(24,50,82,1) 100%);",
    },
  },
  sizes: {
    // // originals
    // sm: "24rem", // 384px
    // md: "28rem", // 448px
    // lg: "32rem", // 512px, not overridden
    // xl: "36rem", // 576px
    // overrides
    base: "100%", // new
    sm: "375px", // 375px (vs 384px) !== // xs?
    md: "744px", // 744px (vs 448px) !==
    // lg: "512px", // 512px, not overridden ==
    xl: "1280px", // 1280px (vs 576px) !== // xl?
  },
  breakpoints: {
    // // originals
    // base: "0em", // 0px
    // sm: "30em", // 480px
    // md: "48em", // 768px
    // lg: "62em", // 992px
    // xl: "80em", // 1280px
    // "2xl": "96em", // 1536px
    // overrides
    base: "0px", // 0px
    sm: "375px", // 375px (vs 480px) !=
    md: "744px", // 744px (vs 768px) !=
    lg: "992px", // 992px (vs 992px) ==
    xl: "1280px", // 1280px (vs 1280px) ==
    "2xl": "1536px", // 1536px (vs 1536px) ==
  },
});

export default customTheme;
