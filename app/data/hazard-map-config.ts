export type HazardLegendKind =
  | "softStory"
  | "liquefaction"
  | "tsunami"
  | "femaRisk";

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
      "seismicOuterLayer",
      "seismicLayer",
    ],
  },
  tsunami: {
    legend: "tsunami",
    layerIds: ["tsunamiLayer"],
  },
  femaRisk: {
    legend: "femaRisk",
    layerIds: ["femaRiskLayer"],
  },
};
