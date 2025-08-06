"use client";

import { useState, createContext } from "react";

type LegendClickedType = {
  name: string;
  time: number;
};

type LegendClickedContextType = {
  legendClicked: LegendClickedType;
  updateLegendClicked: (newString: string) => void;
};

const legendClickedDefault = { name: "", time: Date.now() };

export const LegendClickedContext = createContext<LegendClickedContextType>({
  legendClicked: legendClickedDefault,
  updateLegendClicked: () => {},
});

export const LegendClickedContextProvider = ({
  children,
}: React.PropsWithChildren) => {
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
