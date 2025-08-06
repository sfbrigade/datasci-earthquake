"use client";

import { useState, createContext } from "react";

type LegendClickedContextType = {
  legendClicked: string;
  updateLegendClicked: (newString: string) => void;
};

export const LegendClickedContext = createContext<LegendClickedContextType>({
  legendClicked: "",
  updateLegendClicked: () => {},
});

export const LegendClickedContextProvider = ({
  children,
}: React.PropsWithChildren) => {
  const [legendClicked, setLegendClicked] = useState<string>("");

  const updateLegendClicked = (newString: string) => {
    setLegendClicked(newString);
  };

  const contextValue: LegendClickedContextType = {
    legendClicked,
    updateLegendClicked,
  };

  return (
    <LegendClickedContext value={contextValue}>{children}</LegendClickedContext>
  );
};
