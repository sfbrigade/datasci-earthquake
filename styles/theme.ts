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
    value: { color: "black", bg: "white", borderRadius: "4xl" }, // TODO: compare new 32px to old 30px
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
    }, // TODO: double check if `0.25`, `solid`, and `grey.600` actually resolve
    // TODO: can the color be part of the border value, or should it separately assigned to the `borderColor` prop for it to actually work?
  },
  borderWidths: {
    0.25: { value: "1px" }, // TODO: compare new 1px to old 2px
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
    lightBlue: { value: "#3182CE" }, // blue/500 (TODO: remove if unused)
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
        "radial-gradient(120% 180% at 17.81% 82.6%, {colors.blueGradientFrom} 0%, {colors.blueGradientTo} 100%);", // TODO: double check that this gradient still works
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
  shadows: {
    card: {
      value: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}", // TODO: compare new "1" (4px) to old 5px; also test if _dark works
    },
    mobileButton: {
      value: "{spacing.0} {spacing.0} {spacing.0.5} {colors.lightGrey}", // TODO: compare new "0.5" (2px) to old 3px; also test if _dark works
    },
    search: {
      value:
        "{spacing.0} {spacing.1} {spacing.1.5} {-spacing.0.25} {colors.blackAlpha.200}, {spacing.0} {spacing.0.5} {spacing.1} {-spacing.0.25} {colors.blackAlpha.50}", // TODO: compare new  blackAlpha.50 (rgba(0, 0, 0, 0.04)) vs old rgba(0, 0, 0, 0.06) and new blackAlpha.50 (rgba(0, 0, 0, 0.08)) vs old rgba(0, 0, 0, 0.10),
    },
  },

  /*
    WORKS

    mobileButton: {
      value: {
        _light: "0px 0px 3px #c8caceff",
        _dark: "0px 0px 3px #c8caceff",
      },
    },
    
    card: {
      value: {
        _light: "0px 5px 6px #c8caceff", // TODO: compare new "1" (4px) to old 5px
        _dark: "0px 5px 6px #c8caceff", // TODO: compare new "1" (4px) to old 5px
      },
    },
    
    card: {
      value: {
        _light: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}", // TODO: compare new "1" (4px) to old 5px
        _dark: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}", // TODO: compare new "1" (4px) to old 5px
      },
    },

    card: { value: { _light: "0px 5px 6px #c8caceff", _dark: "0px 5px 6px #c8caceff" }},

    card: { value: { _light: "0 1 1.5 lightGrey", _dark: "0 1 1.5 lightGrey" }},

    card: { value: {
      _light: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}",
      _dark: "{spacing.0} {spacing.1} {spacing.1.5} {colors.lightGrey}",
    }},

    DOES NOT WORK

    card: { value: {
      _light: [":", "1", "1.5", "lightGrey"],
      _dark: ["0", "1", "1.5", "lightGrey"],
    }},
  */
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

// Log out the final merged config in development mode for debugging purposes
if (process.env.NODE_ENV === "development" && console) {
  console.log("SafeHome Chakra UI v3 configuration (theming, tokens, etc):");
  console.dir({
    _originalConfigs: { defaultConfig, overridesConfig },
    ...system._config,
  });
}

export default system;
