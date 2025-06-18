import { createSystem, defaultConfig } from "@chakra-ui/react";

export const system = createSystem(defaultConfig, {
  theme: {
    textStyles: {
      headerBig: {
        fontSize: { value: ["4xl", "4xl", "5xl", "5xl", "6xl", "6xl"] },
        fontWeight: { value: "300" },
        lineHeight: {
          value: ["40px", "40px", "48px", "48px", "60px", "60px"],
        },
        color: { value: "white" },
        fontFamily: { value: "heading" },
      },
      headerReport: {
        fontSize: { value: ["3xl", "3xl", "4xl", "4xl", "4xl", "4xl"] },
        fontWeight: { value: "300" },
        lineHeight: {
          value: ["40px", "40px", "48px", "48px", "60px", "60px"],
        },
        color: { value: "white" },
        fontFamily: { value: "heading" },
      },
      headerMedium: {
        fontSize: { value: ["2xl", "2xl", "3xl", "3xl", "3xl", "3xl"] },
        fontWeight: { value: "500" },
        color: { value: "blue" },
        fontFamily: { value: "heading" },
      },
      headerSmall: {
        fontSize: { value: ["lg", "lg", "lg", "lg", "xl", "xl"] },
        fontWeight: { value: "normal" },
        color: { value: "white" },
        fontFamily: { value: "body" },
      },
      cardTitle: {
        fontSize: { value: "xl" },
        fontWeight: { value: "normal" },
        color: { value: "blue" },
        fontFamily: { value: "body" },
      },
      textBig: {
        fontSize: { value: "xl" },
        fontWeight: { value: "normal" },
        color: { value: "grey.900" },
        fontFamily: { value: "body" },
      },
      textMedium: {
        fontSize: { value: "md" },
        fontWeight: { value: "normal" },
        color: { value: "grey.900" },
        fontFamily: { value: "body" },
      },
      textSmall: {
        fontSize: { value: "xs" },
        fontWeight: { value: "normal" },
        color: { value: "grey.900" },
        fontFamily: { value: "body" },
      },
      textSemibold: {
        fontWeight: { value: "600" },
      },
    },
    layerStyles: {
      list: {
        listStyleType: { value: "disc" },
        paddingLeft: { value: "6" },
      },
      listItem: {
        listStyleType: { value: "disc" },
      },
    },
    tokens: {
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
        blue: { value: "#2B6CB0" }, // blue/600 (TODO: all headings)
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
      breakpoints: {
        // // originals
        // base: { value: "0em" }, // 0px
        // sm: { value: "30em" }, // 480px
        // md: { value: "48em" }, // 768px
        // lg: { value: "62em" }, // 992px
        // xl: { value: "80em" }, // 1280px
        // "2xl": "96em", // 1536px
        // overrides
        base: { value: "0px" }, // 0px
        sm: { value: "375px" }, // 375px (vs 480px) !=
        md: { value: "744px" }, // 744px (vs 768px) !=
        lg: { value: "992px" }, // 992px (vs 992px) ==
        xl: { value: "1280px" }, // 1280px (vs 1280px) ==
        "2xl": { value: "1536px" }, // 1536px (vs 1536px) ==
      },
    },
  },
});
