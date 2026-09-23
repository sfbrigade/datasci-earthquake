export type HazardLegendKind =
  | "softStory"
  | "liquefaction"
  | "tsunami"
  | "femaRisk"
  | "landslide";

type HazardMapConfig = {
  legend: HazardLegendKind;
  layerIds: string[];
};

export const hazardMapConfigByName: Record<string, HazardMapConfig> = {
  softStory: {
    legend: "softStory",
    layerIds: ["softStoriesLayer"],
  },
  liquefaction: {
    legend: "liquefaction",
    layerIds: [
      "seismicBackgroundLayer",
      "seismicBorderOuterLayer",
      "seismicBorderInnerLayer",
    ],
  },
  tsunami: {
    legend: "tsunami",
    layerIds: ["tsunamiLayer", "tsunamiInnerLayer"],
  },
  femaRisk: {
    legend: "femaRisk",
    layerIds: ["femaRiskLayer", "femaRiskInnerLayer"],
  },
  landslide: {
    legend: "landslide",
    layerIds: ["landslideLayer"],
  },
};
