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
  setPadding: jest.fn(),
  getPadding: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
  easeTo: jest.fn(),
  loaded: jest.fn(() => false),
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

const renderMap = (bottomPaddingRatio = 0) =>
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
        bottomPaddingRatio={bottomPaddingRatio}
      />
    </Provider>
  );

describe("Map", () => {
  let mockResizeObserverCallback: ResizeObserverCallback;
  let mockObserve: jest.Mock;
  let mockDisconnect: jest.Mock;
  let originalResizeObserver: typeof window.ResizeObserver;
  let originalClientHeight: PropertyDescriptor | undefined;

  beforeEach(() => {
    process.env.NEXT_PUBLIC_MAPBOX_TOKEN = "test";
    jest.clearAllMocks();
    originalResizeObserver = window.ResizeObserver;
    originalClientHeight = Object.getOwnPropertyDescriptor(
      HTMLElement.prototype,
      "clientHeight"
    );
    Object.defineProperty(HTMLElement.prototype, "clientHeight", {
      configurable: true,
      get: () => 800,
    });
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
    if (originalClientHeight) {
      Object.defineProperty(
        HTMLElement.prototype,
        "clientHeight",
        originalClientHeight
      );
    } else {
      delete (HTMLElement.prototype as { clientHeight?: number }).clientHeight;
    }
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

  it("sets bottom padding from the container height on mount", () => {
    renderMap(0.5);

    expect(mockMapInstance.setPadding).toHaveBeenCalledWith({ bottom: 400 });
  });

  it("resizes and reapplies bottom padding when the container changes size", () => {
    renderMap(0.5);
    mockMapInstance.resize.mockClear();
    mockMapInstance.setPadding.mockClear();

    act(() => {
      mockResizeObserverCallback([], {} as ResizeObserver);
    });

    expect(mockMapInstance.resize).toHaveBeenCalledTimes(1);
    expect(mockMapInstance.setPadding).toHaveBeenCalledWith({ bottom: 400 });
  });

  it("pans with bottom padding when coordinates change", () => {
    const { rerender } = renderMap(0.5);

    rerender(
      <Provider>
        <Map
          lon={-122.5}
          lat={37.7}
          address="123 Main St"
          softStoryData={fc}
          tsunamiData={fc}
          liquefactionData={fc}
          layerToggleObj={{ layerId: "", toggleState: true }}
          bottomPaddingRatio={0.5}
        />
      </Provider>
    );

    expect(mockMapInstance.easeTo).toHaveBeenCalledWith(
      expect.objectContaining({
        padding: { bottom: 400 },
        duration: 750,
      })
    );
  });

  it("sets zero bottom padding on mount", () => {
    renderMap(0);

    expect(mockMapInstance.setPadding).toHaveBeenCalledWith({ bottom: 0 });
  });
});
