import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTextStyles,
  defineLayerStyles,
  defineTokens,
} from "@chakra-ui/react";

const textStyles = defineTextStyles({
  headerBig: {
    description: "header big",
    value: {
      fontFamily: "heading",
      fontSize: ["2xl", "2xl", "3xl", "3xl", "4xl", "4xl"],
      fontWeight: "500",
    },
  },
  headerReport: {
    description: "header report",
    value: {
      fontFamily: "heading",
      fontSize: ["3xl", "3xl", "4xl", "4xl", "4xl", "4xl"],
      fontWeight: "300",
      lineHeight: ["40px", "40px", "48px", "48px", "60px", "60px"],
    },
  },
  headerMedium: {
    description: "header medium",
    value: {
      fontFamily: "heading",
      fontSize: ["xl", "xl", "2xl", "2xl", "2xl", "2xl"],
      fontWeight: "500",
    },
  },
  headerSmall: {
    description: "header small",
    value: {
      fontFamily: "body",
      fontSize: ["lg", "lg", "lg", "lg", "xl", "xl"],
      fontWeight: "normal",
    },
  },
  cardTitle: {
    description: "card title",
    value: {
      fontFamily: "body",
      fontSize: "xl",
      fontWeight: "normal",
    },
  },
  textBig: {
    description: "text big",
    value: {
      fontFamily: "body",
      fontSize: "xl",
      fontWeight: "normal",
    },
  },
  textMedium: {
    description: "text medium",
    value: {
      fontFamily: "body",
      fontSize: "md",
      fontWeight: "normal",
    },
  },
  textSmall: {
    description: "text small",
    value: {
      fontFamily: "body",
      fontSize: "sm",
      fontWeight: "normal",
    },
  },
  textXSmall: {
    description: "text extra small",
    value: {
      fontFamily: "body",
      fontSize: "xs",
      fontWeight: "normal",
    },
  },
  cardTextMedium: {
    description: "hazard card text medium",
    value: {
      fontFamily: "body",
      fontSize: "md",
      fontWeight: "normal",
    },
  },
  cardTextSmall: {
    description: "hazard card text small",
    value: {
      fontFamily: "body",
      fontSize: 15.2,
      fontWeight: "normal",
    },
  },
  cardTextXSmall: {
    description: "hazard card text small",
    value: {
      fontFamily: "body",
      fontSize: 14.4,
      fontWeight: "normal",
    },
  },
  textSemibold: {
    description: "text semibold",
    value: {
      fontWeight: "600",
    },
  },
  textPrerelease: {
    description: "text prerelease",
    value: {
      fontSize: "12px",
      lineHeight: "12px",
      fontWeight: "bold",
      textTransform: "uppercase",
    },
  },
});

const layerStyles = defineLayerStyles({
  // TODO: try to combine text styles and layer styles if possible (e.g., using Chakra v3 component) (post-migration from v2 to v3)
  // for textStyles: headerBig, headerReport, headerSmall
  headerMain: {
    description: "header main",
    value: { color: "white" },
  },
  // for textStyles: headerMedium, cardTitle
  headerAlt: {
    description: "header alt",
    value: { color: "blue.text" },
  },
  // for textStyles: textSmall, textMedium, textBig
  text: {
    description: "text",
    value: { color: "grey.900" },
  },
  prerelease: {
    description: "prerelease",
    value: { color: "#ccc" },
  },
  list: {
    description: "list",
    value: { paddingLeft: "6", marginTop: "2" },
  },
  mobileButton: {
    description: "mobile button",
    value: { color: "black", bg: "white", borderRadius: "30px" },
  },
});

const tokens = defineTokens({
  fonts: {
    heading: { value: "Manrope, sans-serif" },
    body: { value: "Inter, sans-serif" },
  },
  colors: {
    grey: {
      200: { value: "#E2E8F0" },
      400: { value: "#A0AEC0" },
      600: { value: "#4A5568" },
      900: { value: "#171923" },
    },
    white: { value: "#FFF" },
    blueBackground: { value: "#2C5282" }, // blue/700
    blue: { 600: { value: "#0088FF" }, text: { value: "#2B6CB0" } }, // blue/600 (TODO: all headings) // "#0088FF" comes from Figma switches
    lightBlue: { value: "#3182CE" }, // blue/500 (TODO: remove)
    tsunamiBlue: { value: "#63B3ED" }, // blue/300
    yellow: { value: "#ECC94B" },
    red: { value: "#C53030" },
    green: { value: "#25855A" },
    orange: { value: "#F6AD55" },
    pink: { value: "#ED64A6" },
    gradient: {
      blue: {
        value:
          "radial-gradient(120% 180% at 17.81% 82.6%, rgba(59,98,148,1) 0%, rgba(24,50,82,1) 100%);",
      },
    },
  },
  sizes: {
    // // originals
    // sm: { value: "24rem" }, // 384px
    // md: { value: "28rem" }, // 448px
    // lg: { value: "32rem" }, // 512px, not overridden
    // xl: { value: "36rem" }, // 576px
    // overrides
    base: { value: "100%" }, // new
    sm: { value: "375px" }, // 375px (vs 384px) !== // xs?
    md: { value: "744px" }, // 744px (vs 448px) !==
    // lg: { value: "512px" }, // 512px, not overridden ==
    xl: { value: "1280px" }, // 1280px (vs 576px) !== // xl?
  },
});

/*
  breakpoints:
  sm: "480px"​​​
  md: "768px"
  lg: "1024px"
  xl: "1280px"
  2xl: "1536px"​​​
*/

/* Global CSS: https://chakra-ui.com/docs/theming/customization/global-css#add-global-styles */
const globalCss = {
  ".marker": {
    width: "26.2px",
    height: "41px",
    backgroundImage: "url('/marker.svg')",
    backgroundSize: "cover",
    borderRadius: 0,
  },
  ".mapboxgl-ctrl-group button": {
    width: "40px",
    height: "40px",
  },
  ".mapboxgl-ctrl-bottom-right": {
    marginRight: "16px",
  },
};

const config = defineConfig({
  preflight: true, // explicitly enable reset styles (AKA preflight styles)
  globalCss,
  strictTokens: false,
  theme: {
    textStyles,
    layerStyles,
    tokens,
  },
});

export default createSystem(defaultConfig, config);
