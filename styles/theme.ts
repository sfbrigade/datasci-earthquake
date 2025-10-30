import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTextStyles,
  defineLayerStyles,
  defineTokens,
  SystemConfig,
  ThemingConfig,
} from "@chakra-ui/react";

// TODO: look into whether it makes sense to use responsive text sizes just for headings as is done below; perhaps another approach is better
const textStyles: ThemingConfig["textStyles"] = defineTextStyles({
  headerBig: {
    description: "header big",
    value: {
      fontFamily: "heading",
      fontSize: ["2xl", "2xl", "3xl", "3xl", "4xl", "4xl"],
      fontWeight: "medium",
    },
  },
  headerReport: {
    description: "header report",
    value: {
      fontFamily: "heading",
      fontSize: ["3xl", "3xl", "4xl", "4xl", "4xl", "4xl"], // 30, 30, 36, 36, 36, 36
      fontWeight: "light",
      lineHeight: ["short", "short", "short", "short", "tall", "tall"],
      // TODO: compare new line heights: 37.5px, 37.5px, 49.5px, 49.5px, 58.5px, 58.5px (1.375, 1.375, 1.375, 1.375, 1.625, 1.625)
      // - to original line heights: 40px, 40px, 48px, 48px, 60px, 60px
      // TODO: consider replacing this header's line-height with combo of line-height and vertical margin (margin via a textStyle?)
    },
  },
  headerMedium: {
    description: "header medium",
    value: {
      fontFamily: "heading",
      fontSize: ["xl", "xl", "2xl", "2xl", "2xl", "2xl"],
      fontWeight: "medium",
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
      fontSize: "md",
      fontWeight: "normal",
    },
  },
  cardTextXSmall: {
    description: "hazard card text xsmall",
    value: {
      fontFamily: "body",
      fontSize: "sm",
      fontWeight: "normal",
    },
  },
  textSemibold: {
    description: "text semibold",
    value: {
      fontWeight: "semibold",
    },
  },
  textPrerelease: {
    description: "text prerelease",
    value: {
      fontSize: "xs",
      lineHeight: "none",
      fontWeight: "bold",
      textTransform: "uppercase",
    },
  },
});

const layerStyles: ThemingConfig["layerStyles"] = defineLayerStyles({
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
    value: { color: "gray.300" },
  },
  list: {
    description: "list",
    value: { paddingLeft: "6", marginTop: "2" },
  },
  mobileButton: {
    description: "mobile button",
    value: { color: "black", bg: "white", borderRadius: "4xl" }, // TODO: compare new 32px to old 30px
  },
});

// TODO: move appropriate tokens to semanticTokens and remove unused tokens
const tokens: ThemingConfig["tokens"] = defineTokens({
  assets: {
    mapMarker: { type: "url", value: "/marker.svg" },
  },
  fonts: {
    heading: { value: "Manrope, sans-serif" },
    body: { value: "Inter, sans-serif" },
  },
  colors: {
    // TODO: fallback to Chakra defaults where possible and get rid of unused colors
    grey: {
      200: { value: "#E2E8F0" },
      400: { value: "#A0AEC0" },
      600: { value: "#4A5568" },
      900: { value: "#171923" },
    },
    white: { value: "#FFF" },
    blueBackground: { value: "#2C5282" }, // blue/700
    blue: { 600: { value: "#0088FF" }, text: { value: "#2B6CB0" } }, // blue/600 (TODO: all headings) // "#0088FF" comes from Figma switches
    lightBlue: { value: "#3182CE" }, // blue/500 (TODO: remove if unused)
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
  lineHeights: {
    none: { value: 1 },
  },
  spacing: {
    0: { value: 0 }, // explicit 0 value for margin, padding, etc.
  },
  sizes: {
    // TODO: replace all these and their references with Chakra defaults (consider even replacing eg 375px with 480px/the rem equivalent)
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

    // used in global CSS for map marker
    // TODO: adjust these so that they are based on Chakra sizing scale
    mapMarkerWidth: { value: "26.2px" },
    mapMarkerHeight: { value: "41px" },
  },
});

/*
  Breakpoints:
  // TODO: test and finalize breakpoints
  - sm: "480px"​​​
  - md: "768px"
  - lg: "1024px" // TODO: is this 996px or 1024px? docs say 996px, but live config from `console.dir` below shows 1024px
  - xl: "1280px"
  - 2xl: "1536px"​​​
*/

/* Global CSS: https://chakra-ui.com/docs/theming/customization/global-css#add-global-styles */
// TODO: attempt to replace this and the related DOM manipulation code in `map.tsx` with React code (if performant)
// - see: https://docs.mapbox.com/help/tutorials/dynamic-markers-react/?step=0
// - also see: https://docs.mapbox.com/help/tutorials/use-mapbox-gl-js-with-react/
const globalCss: SystemConfig["globalCss"] = {
  ".marker": {
    width: "mapMarkerWidth",
    height: "mapMarkerHeight",
    backgroundImage: "mapMarker",
    backgroundSize: "cover",
    borderRadius: "none",
  },
  ".mapboxgl-ctrl-group button": {
    width: "10",
    height: "10",
  },
  ".mapboxgl-ctrl-bottom-right": {
    marginRight: "4",
  },
};

const overridesConfig: SystemConfig = defineConfig({
  preflight: true, // explicitly enable reset styles (AKA preflight styles)
  globalCss,
  strictTokens: false,
  theme: {
    textStyles,
    layerStyles,
    tokens,
  },
});

const system = createSystem(defaultConfig, overridesConfig);

// Log out the final merged config in development mode for debugging purposes
if (process.env.NODE_ENV === "development" && console) {
  console.log("SafeHome Chakra UI v3 configuration (theming, tokens, etc):");
  console.dir({
    _originalConfigs: { defaultConfig, overridesConfig },
    ...system._config,
  });
}

export default system;
