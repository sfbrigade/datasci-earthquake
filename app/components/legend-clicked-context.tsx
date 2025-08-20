"use client";

import { useState, createContext, PropsWithChildren } from "react";

export type LegendClickedType = {
  name: string;
  time: number;
};

export type LegendClickedContextType = {
  legendClicked: LegendClickedType;
  updateLegendClicked: (newString: string) => void;
};

const legendClickedDefault = { name: "", time: Date.now() };

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

  const updateLegendClicked = (newString: string) => {
    setLegendClicked({ name: newString, time: Date.now() });
  };

  const contextValue: LegendClickedContextType = {
    legendClicked,
    updateLegendClicked,
  };

  return (
    <LegendClickedContext value={contextValue}>{children}</LegendClickedContext>
  );
};
