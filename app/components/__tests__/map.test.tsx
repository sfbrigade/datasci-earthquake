import React from "react";
import { act, render } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Provider } from "../ui/provider";
import { toaster } from "@/components/ui/toaster";
import Map from "../map";
import type { LayerToggleObjProps } from "../address-mapper";

const mockMapInstance = {
  touchZoomRotate: { disableRotation: jest.fn() },
  addControl: jest.fn(),
  on: jest.fn(),
  getCenter: jest.fn(() => ({ lng: 0, lat: 0 })),
  getZoom: jest.fn(() => 10),
  setConfigProperty: jest.fn(),
  setPadding: jest.fn(),
  getPadding: jest.fn(() => ({ top: 0, right: 0, bottom: 0, left: 0 })),
  easeTo: jest.fn(),
  loaded: jest.fn(() => false),
  resize: jest.fn(),
  getLayer: jest.fn(),
  setLayoutProperty: jest.fn(),
  addSource: jest.fn(),
  addLayer: jest.fn(),
  loadImage: jest.fn(),
  hasImage: jest.fn(() => false),
  addImage: jest.fn(),
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

jest.mock("../../../styles/resolve-color-token", () => ({
  resolveColorToken: jest.fn(() => "#0088cc"),
}));

const getMapListener = (event: string) =>
  mockMapInstance.on.mock.calls.find(([name]) => name === event)![1];

const renderMap = (bottomPaddingRatio = 0) =>
  render(
    <Provider>
      <Map
        lon={-122.4}
        lat={37.8}
        address="123 Main St"
        layerToggleObj={{ layerIds: [], toggleState: true }}
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
          layerToggleObj={{ layerIds: [], toggleState: true }}
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

  it.each([
    { toggles: [], visibility: "visible" },
    { toggles: [false], visibility: "none" },
    { toggles: [false, true], visibility: "visible" },
  ])(
    "applies $visibility to the delayed tsunami hatch after toggles $toggles",
    ({ toggles, visibility }) => {
      const mapWithToggle = (layerToggleObj: LayerToggleObjProps) => (
        <Provider>
          <Map
            lon={-122.4}
            lat={37.8}
            address="123 Main St"
            layerToggleObj={layerToggleObj}
          />
        </Provider>
      );
      const { rerender } = render(
        mapWithToggle({ layerIds: [], toggleState: true })
      );

      act(() => {
        getMapListener("load")();
      });

      for (const toggleState of toggles) {
        rerender(
          mapWithToggle({
            layerIds: ["tsunamiLayer", "tsunamiInnerLayer"],
            toggleState,
          })
        );
      }
      // Another hazard's toggle must not overwrite the tsunami selection.
      rerender(
        mapWithToggle({ layerIds: ["femaRiskLayer"], toggleState: false })
      );
      mockMapInstance.setLayoutProperty.mockClear();

      act(() => {
        const onImageLoaded = mockMapInstance.loadImage.mock.calls[0][1];
        onImageLoaded(null, { width: 16, height: 16 });
      });

      expect(mockMapInstance.addLayer).toHaveBeenLastCalledWith(
        expect.objectContaining({ id: "tsunamiLayer" })
      );
      expect(mockMapInstance.setLayoutProperty).toHaveBeenCalledWith(
        "tsunamiLayer",
        "visibility",
        visibility
      );
    }
  );

  it("adds each layer source by its static file URL", () => {
    renderMap();

    act(() => {
      getMapListener("load")();
    });

    expect(mockMapInstance.addSource.mock.calls).toEqual([
      ["seismic", { type: "geojson", data: "/data/LiquefactionZone.geojson" }],
      ["tsunami", { type: "geojson", data: "/data/TsunamiZone.geojson" }],
      ["fema-risk", { type: "geojson", data: "/data/EarthquakeRisk.geojson" }],
    ]);
  });

  it("toggles layers before their data has loaded", () => {
    mockMapInstance.getLayer.mockReturnValueOnce({});
    const { rerender } = renderMap();

    act(() => {
      getMapListener("load")();
    });

    rerender(
      <Provider>
        <Map
          lon={-122.4}
          lat={37.8}
          address="123 Main St"
          layerToggleObj={{
            layerIds: ["femaRiskLayer"],
            toggleState: false,
          }}
        />
      </Provider>
    );

    expect(mockMapInstance.setLayoutProperty).toHaveBeenCalledWith(
      "femaRiskLayer",
      "visibility",
      "none"
    );
  });

  describe("when a layer file fails to load", () => {
    beforeEach(() => {
      jest.spyOn(console, "error").mockImplementation(() => {});
    });

    afterEach(() => {
      jest.mocked(console.error).mockRestore();
    });

    const loadMapAndGetErrorListener = () => {
      renderMap();
      act(() => {
        getMapListener("load")();
      });
      return getMapListener("error");
    };

    it("shows a data load error toast per failed layer", () => {
      const onError = loadMapAndGetErrorListener();

      onError({ error: new Error("Not Found"), sourceId: "tsunami" });
      onError({ error: new Error("Not Found"), sourceId: "fema-risk" });

      expect(toaster.create).toHaveBeenCalledTimes(2);
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "data-load-failed-tsunami",
          title: "Data Load Error",
          description: "Tsunami Zones: Not Found",
        })
      );
      expect(toaster.create).toHaveBeenCalledWith(
        expect.objectContaining({
          id: "data-load-failed-fema-risk",
          title: "Data Load Error",
          description: "Fema Risk Zones: Not Found",
        })
      );
    });

    it("does not repeat a toast that is still visible", () => {
      const onError = loadMapAndGetErrorListener();
      (toaster.isVisible as jest.Mock).mockReturnValueOnce(true);

      onError({ error: new Error("Not Found"), sourceId: "tsunami" });

      expect(toaster.isVisible).toHaveBeenCalledWith(
        "data-load-failed-tsunami"
      );
      expect(toaster.create).not.toHaveBeenCalled();
    });

    it("ignores errors from sources that are not layer files", () => {
      const onError = loadMapAndGetErrorListener();

      onError({ error: new Error("Not Found"), sourceId: "composite" });

      expect(toaster.create).not.toHaveBeenCalled();
    });
  });
});
