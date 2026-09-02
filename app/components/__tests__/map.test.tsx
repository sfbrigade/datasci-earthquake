import React from "react";
import { act, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Provider } from "../ui/provider";
import Map from "../map";

const mockMapInstance = {
  touchZoomRotate: { disableRotation: jest.fn() },
  addControl: jest.fn(),
  on: jest.fn(),
  getCenter: jest.fn(() => ({ lng: 0, lat: 0 })),
  panTo: jest.fn(),
  resize: jest.fn(),
  getLayer: jest.fn(),
  setLayoutProperty: jest.fn(),
};

jest.mock("mapbox-gl", () => {
  const Map = jest.fn(() => mockMapInstance);
  const Marker = jest.fn(() => ({
    setLngLat: jest.fn().mockReturnThis(),
    addTo: jest.fn().mockReturnThis(),
    remove: jest.fn(),
  }));
  class LngLat {
    constructor(
      public lng: number,
      public lat: number
    ) {}
  }
  const NavigationControl = jest.fn();

  return {
    __esModule: true,
    default: { Map, Marker, NavigationControl, accessToken: "" },
    LngLat,
  };
});

jest.mock("@/components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
    isVisible: jest.fn(() => false),
  },
}));

const fc = {
  type: "FeatureCollection" as const,
  features: [],
};

const renderMap = () =>
  render(
    <Provider>
      <Map
        lon={-122.4}
        lat={37.8}
        address="123 Main St"
        softStoryData={fc}
        tsunamiData={fc}
        liquefactionData={fc}
        layerToggleObj={{ layerId: "", toggleState: true }}
      />
    </Provider>
  );

describe("Map", () => {
  let mockResizeObserverCallback: ResizeObserverCallback;
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;
  let originalResizeObserver: typeof window.ResizeObserver;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = "test";
    jest.clearAllMocks();
    originalResizeObserver = window.ResizeObserver;
    mockObserve = jest.fn();
    mockDisconnect = jest.fn();

    window.ResizeObserver = class implements ResizeObserver {
      constructor(callback: ResizeObserverCallback) {
        mockResizeObserverCallback = callback;
      }

      observe = mockObserve;
      unobserve = jest.fn();
      disconnect = mockDisconnect;
    };
  });

  afterEach(() => {
    window.ResizeObserver = originalResizeObserver;
  });

  it("observes the map container on mount", () => {
    renderMap();

    expect(mockObserve).toHaveBeenCalledTimes(1);
    expect(mockObserve).toHaveBeenCalledWith(expect.any(HTMLElement));
  });

  it("resizes the map when the container changes size", () => {
    renderMap();

    act(() => {
      mockResizeObserverCallback([], {} as ResizeObserver);
    });

    expect(mockMapInstance.resize).toHaveBeenCalledTimes(1);
  });

  it("disconnects the observer on unmount", () => {
    const { unmount } = renderMap();

    unmount();

    expect(mockDisconnect).toHaveBeenCalledTimes(1);
  });
});
