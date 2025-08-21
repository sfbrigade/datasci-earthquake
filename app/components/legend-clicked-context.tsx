"use client";

import { useState, createContext, PropsWithChildren } from "react";

export type LegendClickedType = {
  name: string;
  softStoryToggled: boolean;
  liquefactionToggled: boolean;
  tsunamiToggled: boolean;
};

export type LegendClickedContextType = {
  legendClicked: LegendClickedType;
  updateLegendClicked: (hazardName: string, layerState?: string) => void;
};

const legendClickedDefault = {
  name: "",
  softStoryToggled: false,
  liquefactionToggled: false,
  tsunamiToggled: false,
};

const legendClickedContextDefault = {
  legendClicked: legendClickedDefault,
  updateLegendClicked: () => {},
} as LegendClickedContextType;

export const LegendClickedContext = createContext(legendClickedContextDefault);

export const LegendClickedContextProvider = ({
  children,
}: PropsWithChildren) => {
  const [legendClicked, setLegendClicked] =
    useState<LegendClickedType>(legendClickedDefault);

  const updateLegendClicked = (hazardName: string, layerState?: string) => {
    if (layerState === undefined) {
      setLegendClicked({
        name: hazardName,
        softStoryToggled: legendClicked.softStoryToggled,
        liquefactionToggled: legendClicked.liquefactionToggled,
        tsunamiToggled: legendClicked.tsunamiToggled,
      });
    }
    if (hazardName === "softStory" && layerState != undefined) {
      setLegendClicked({
        name: "",
        softStoryToggled: !legendClicked.softStoryToggled,
        liquefactionToggled: legendClicked.liquefactionToggled,
        tsunamiToggled: legendClicked.tsunamiToggled,
      });
    }
    if (hazardName === "liquefaction" && layerState != undefined) {
      setLegendClicked({
        name: "",
        softStoryToggled: legendClicked.softStoryToggled,
        liquefactionToggled: !legendClicked.liquefactionToggled,
        tsunamiToggled: legendClicked.tsunamiToggled,
      });
    }
    if (hazardName === "tsunami" && layerState != undefined) {
      setLegendClicked({
        name: "",
        softStoryToggled: legendClicked.softStoryToggled,
        liquefactionToggled: legendClicked.liquefactionToggled,
        tsunamiToggled: !legendClicked.tsunamiToggled,
      });
    }
  };

  const contextValue: LegendClickedContextType = {
    legendClicked,
    updateLegendClicked,
  };

  return (
    <LegendClickedContext value={contextValue}>{children}</LegendClickedContext>
  );
};
