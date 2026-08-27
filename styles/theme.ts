import {
  createSystem,
  defaultConfig,
  defineConfig,
  defineTextStyles,
  defineLayerStyles,
  SystemConfig,
  ThemingConfig,
} from "@chakra-ui/react";
import { semanticTokens, tokens } from "./generated-dtcg-theme";

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
    backgroundColor: "cooperativeGesturesOverlay !important",
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
