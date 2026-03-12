import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTextStyles,
  defineLayerStyles,
  defineTokens,
  SystemConfig,
  ThemingConfig,
  defineSemanticTokens,
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
      fontSize: "sm",
      fontWeight: "normal",
    },
  },
  cardTextXSmall: {
    description: "hazard card text xsmall",
    value: {
      fontFamily: "body",
      fontSize: "xs",
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
      lineHeight: "shortest",
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
    value: { color: "black", bg: "white", borderRadius: "4xl" },
  },
});

// TODO: move appropriate tokens to semanticTokens and remove unused tokens
const tokens: ThemingConfig["tokens"] = defineTokens({
  assets: {
    mapMarkerUrl: { type: "url", value: 'url("/marker.svg")' },
  },
  borders: {
    none: { value: "none" },
    search: {
      value: "{borderWidths.0.25} {borderStyles.solid} {colors.grey.600}",
    },
  },
  borderWidths: {
    0.25: { value: "1px" },
  },
  borderStyles: {
    solid: { value: "solid" },
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
    blue: { 600: { value: "#0088FF" }, text: { value: "#2B6CB0" } }, // blue/600 (TODO: all headings) // "#0088FF" comes from Figma switches
    yellow: { value: "#ECC94B" },
    red: { value: "#C53030" },
    green: { value: "#25855A" },
    orange: { value: "#F6AD55" },
    pink: { value: "#ED64A6" },

    // TODO: move some of these to `semanticTokens` and rename accordingly
    blueBackground: { value: "#2C5282" }, // blue/700
    tsunamiBlue: { value: "#63B3ED" }, // blue/300
    lightGrey: { value: "#c8caceff" },
    labelGrey: { value: "#bfb9b9" },
    warningRed: { value: "#b53d37" },
    blueGradientFrom: { value: "#3b6294" },
    blueGradientTo: { value: "#183252" },
  },
  gradients: {
    // string value
    blue: {
      value:
        "radial-gradient(120% 180% at 17.81% 82.6%, {colors.blueGradientFrom} 0%, {colors.blueGradientTo} 100%);",
    },
  },
  lineHeights: {
    shortest: { value: 1 },
  },
  spacing: {
    0: { value: 0 }, // explicit 0 value for margin, padding, etc.
    auto: { value: "auto" }, // explicit "auto" value for margin
  },
  sizes: {
    // for popover content maxHeight
    unset: { value: "unset" },

    // map marker (global CSS)
    // TODO: adjust these so that they are based on Chakra sizing scale
    // TODO: convert this to default sizes
    mapMarkerWidth: { value: "26.2px" },
    mapMarkerHeight: { value: "41px" },

    // mobile card
    // TODO: convert this to default sizes
    mobileCardWidth: { value: "86vw" },
    mobileCardAccordionWidth: { value: "98%" },

    // image sizess
    // TODO: convert this to default sizes (and get images of equal or retina dimensions)
    earthquakeReadyImageWidth: { value: "303px" }, // 606px real width
    earthquakeReadyImageHeight: { value: "292px" }, // 584px real width
    aboutImageWidth: { value: "304px" },
    aboutImageHeight: { value: "282px" },
    termsImageWidth: { value: "300px" },
    termsImageHeight: { value: "300px" },
    safeHomeLogoWidth: { value: "142px" }, // 619 real width
    safeHomeLogoHeight: { value: "28px" }, // 122 real width
    sfctLogoWidth: { value: "206px" },
    sfctLogoHeight: { value: "54px" },
  },
});

const semanticTokens: ThemingConfig["semanticTokens"] = defineSemanticTokens({
  // TODO: test what happens for dark mode (_light vs dark)
  shadows: {
    card: {
      value: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}",
    },
    mobileButton: {
      value: "{spacing.0} {spacing.0} {spacing.0.5} {colors.lightGrey}",
    },
    search: {
      value:
        "{spacing.0} {spacing.1} {spacing.1.5} {-spacing.0.25} {colors.blackAlpha.200}, {spacing.0} {spacing.0.5} {spacing.1} {-spacing.0.25} {colors.blackAlpha.50}",
    },
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
    backgroundImage: "mapMarkerUrl",
    backgroundSize: "cover",
    borderRadius: "none",
  },
  // NOTE: !important required to override due to the use of @layer in Chakra UI; alternative is to turn off @layer in Chakra config
  // TODO: consider looking into better workarounds or turning off @layer
  ".mapboxgl-ctrl-group button": {
    width: "10 !important",
    height: "10 !important",
  },
  ".mapboxgl-ctrl-bottom-right": {
    marginRight: "4 !important",
  },
};

const overridesConfig: SystemConfig = defineConfig({
  preflight: true, // explicitly enable reset styles (AKA preflight styles)
  globalCss,
  strictTokens: true,
  theme: {
    textStyles,
    layerStyles,
    tokens,
    semanticTokens,
  },
});

const system = createSystem(defaultConfig, overridesConfig);

export default system;
