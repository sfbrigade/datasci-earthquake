"use client";

import {
  createContext,
  useContext,
  useMemo,
  useState,
  type Dispatch,
  type PropsWithChildren,
  type SetStateAction,
} from "react";

interface MapStateContextValue {
  isSearchComplete: boolean;
  setSearchComplete: Dispatch<SetStateAction<boolean>>;
}

const MapStateContext = createContext<MapStateContextValue | null>(null);

export function MapStateProvider({ children }: PropsWithChildren) {
  const [isSearchComplete, setSearchComplete] = useState(false);

  const value = useMemo<MapStateContextValue>(
    () => ({
      isSearchComplete,
      setSearchComplete,
    }),
    [isSearchComplete]
  );

  return (
    <MapStateContext.Provider value={value}>
      {children}
    </MapStateContext.Provider>
  );
}

export function useMapState(): MapStateContextValue {
  const context = useContext(MapStateContext);

  if (!context) {
    throw new Error("useMapState must be used inside MapStateProvider");
  }

  return context;
}
