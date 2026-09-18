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
import { InterVariableName, ManropeVariableName } from "@/data/constants";

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
  textStart: {
    description: "text for start button",
    value: {
      fontSize: "md",
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
    tsunamiHatch: {
      type: "url",
      value: 'url("/images/tsunami-hatch-fine-16.png")',
    },
  },
  borders: {
    none: { value: "none" },
    search: {
      value: "{borderWidths.0.25} {borderStyles.solid} {colors.grey.600}",
    },
    softStoryLegend: {
      value: "{borderWidths.0.25} {borderStyles.solid} {colors.white}",
    },
    tsunamiLegend: {
      value:
        "{borderWidths.0.25} {borderStyles.solid} rgba(43, 108, 176, 0.35)", // TODO: replace color with token
    },
  },
  borderWidths: {
    0.25: { value: "1px" },
  },
  borderStyles: {
    solid: { value: "solid" },
  },
  fonts: {
    heading: { value: `var(${ManropeVariableName}), sans-serif` },
    body: { value: `var(${InterVariableName}), sans-serif` },
  },
  colors: {
    // TODO: fallback to Chakra defaults where possible and get rid of unused colors
    grey: {
      200: { value: "#E2E8F0" },
      400: { value: "#A0AEC0" },
      600: { value: "#4A5568" },
      900: { value: "#171923" },
    },
    peach: { DEFAULT: { value: "#F5F5F5" } },
    white: { DEFAULT: { value: "#FFF" } },
    blue: { 600: { value: "#0088FF" }, text: { value: "#2B6CB0" } }, // blue/600 (TODO: all headings) // "#0088FF" comes from Figma switches
    yellow: { DEFAULT: { value: "#ECC94B" } },
    red: { DEFAULT: { value: "#C53030" } },
    green: { DEFAULT: { value: "#25855A" } },
    pink: { DEFAULT: { value: "#ED64A6" } },
    blueBackground: { value: "#2C5282" }, // blue/700
  },
  lineHeights: {
    shortest: { value: 1 },
  },
  spacing: {
    0: { value: 0 }, // explicit 0 value for margin, padding, etc.
    auto: { value: "auto" }, // explicit "auto" value for e.g. margin
    "1/2": { value: "50%" }, // convenience token for 50% (e.g. top="1/2")
  },
  sizes: {
    // for popover content maxHeight
    unset: { value: "unset" },
    auto: { value: "auto" }, // explicit "auto" value for e.g. width
    none: { value: "none" }, // explicit "none" value for e.g. max-width

    // map marker (global CSS)
    // TODO: adjust these so that they are based on Chakra sizing scale
    // TODO: convert this to default sizes
    mapMarkerWidth: { value: "26.2px" },
    mapMarkerHeight: { value: "41px" },

    // mobile card
    // TODO: convert this to default sizes
    mobileCardWidth: { value: "86vw" },
    mobileCardAccordionWidth: { value: "98%" },

    // main content area (map + side panel)
    mainContentMinHeight: { value: 0 },
  },
});

const semanticTokens: ThemingConfig["semanticTokens"] = defineSemanticTokens({
  // TODO: tie to color palette?
  colors: {
    switch: { value: "#3182CE" },
    icon: { value: "#4863a9" },
    iconBackground: { value: "#eff4fc" },
    pageBackground: { value: "#2C5282" },
    tsunami: { value: "#63B3ED" },
    muted: { value: "#c8caceff" },
    label: { value: "#bfb9b9" },
    warning: { value: "#b53d37" },
    gradientFrom: { value: "#3b6294" },
    gradientTo: { value: "#183252" },
    overlay: { value: "#00000080" },
    liquefaction: {
      background: {
        value: "{colors.orange.300/4}", // used with 4% opacity
      },
      border: {
        value: "{colors.orange.600/90}", // used with 90% opacity
      },
    },
    femaRisk: {
      lower: {
        value: { _light: "#BE123C04", _dark: "#BE123C04" },
      },
      moderate: {
        value: { _light: "#BE123C09", _dark: "#BE123C09" },
      },
      high: {
        value: { _light: "#BE123C14", _dark: "#BE123C14" },
      },
      veryHigh: {
        value: { _light: "#BE123C2E", _dark: "#BE123C2E" },
      },
    },
  },
  shadows: {
    card: {
      value: "{spacing.0} {spacing.1} {spacing.1.5} {colors.muted}",
    },
    mobileButton: {
      value: "{spacing.0} {spacing.0} {spacing.0.5} {colors.muted}",
    },
    search: {
      value:
        "{spacing.0} {spacing.1} {spacing.1.5} {-spacing.0.25} {colors.blackAlpha.200}, {spacing.0} {spacing.0.5} {spacing.1} {-spacing.0.25} {colors.blackAlpha.50}",
    },
    liquefaction: {
      value: "inset 0 0 0 3px {colors.orange.300/35}",
    },
  },
  gradients: {
    fema: {
      value:
        "linear-gradient(to right, {colors.femaRisk.lower} 0%, {colors.femaRisk.lower} 25%, {colors.femaRisk.moderate} 25%, {colors.femaRisk.moderate} 50%, {colors.femaRisk.high} 50%, {colors.femaRisk.high} 75%, {colors.femaRisk.veryHigh} 75%, {colors.femaRisk.veryHigh} 100%);",
    },
    blue: {
      value:
        "radial-gradient(120% 180% at 17.81% 82.6%, {colors.gradientFrom} 0%, {colors.gradientTo} 100%);",
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
  "html, body": {
    fontFamily: "body", // This applies Inter (the "body" token) globally
  },
  ".chakra-drawer__positioner": {
    zIndex: "docked !important",
  },
  ".marker": {
    width: "mapMarkerWidth",
    height: "mapMarkerHeight",
    backgroundImage: "mapMarkerUrl",
    backgroundSize: "cover",
    borderRadius: "none",
  },
  ".mapboxgl-scroll-zoom-blocker, .mapboxgl-touch-pan-blocker": {
    backgroundColor: "overlay !important",
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
    // components: {
    //   Alert: {
    //     variants: {
    //       subtle: {
    //         root: {
    //           _light: {
    //             bg: "colorPalette.100",
    //             color: "colorPalette.700",
    //           },
    //         },
    //       },
    //     },
    //   },
    // },
  },
});

const system = createSystem(defaultConfig, overridesConfig);

export default system;
