import React from "react";
import { render, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";

import { Provider } from "../ui/provider";
import { MapStateProvider } from "../map-state-provider";
import AddressMapper from "../address-mapper";

const fetchHazardDataMock = jest.fn();
const mockGet = jest.fn();
const mockToString = jest.fn();
const mockUseServerInsertedHTML = jest.fn();

jest.mock("../../hooks/useHazardDataFetcher", () => ({
  useHazardDataFetcher: jest.fn(() => ({
    fetchHazardData: fetchHazardDataMock,
  })),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({
    get: mockGet,
    toString: mockToString,
  })),
  usePathname: jest.fn(() => "/"),
  useServerInsertedHTML: jest.fn(() => mockUseServerInsertedHTML),
}));

jest.mock("../map", () => {
  return jest.fn((props) => (
    <div
      data-testid="map"
      data-coordinates={JSON.stringify([props.lon, props.lat])}
    >
      Mocked Map
    </div>
  ));
});

jest.mock("../report-hazards", () => {
  return jest.fn((props) => (
    <div data-testid="report-hazards">
      {JSON.stringify(props.addressHazardData)}
    </div>
  ));
});

jest.mock("@/components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
    isVisible: jest.fn(() => false),
  },
}));

const defaultCoords = [-122.4194, 37.7949];

const mockFeatureCollection = {
  type: "FeatureCollection" as const,
  features: [],
};

const mockProps = {
  softStoryData: mockFeatureCollection,
  tsunamiData: mockFeatureCollection,
  liquefactionData: mockFeatureCollection,
};

const mockSetSearchParams = (params: Record<string, string>) => {
  const urlSearchParams = new URLSearchParams(params);

  mockGet.mockImplementation((key: string) => urlSearchParams.get(key));

  mockToString.mockReturnValue(urlSearchParams.toString());
};

const renderAddressMapper = () =>
  render(
    <Provider>
      <MapStateProvider>
        <AddressMapper {...mockProps} />
      </MapStateProvider>
    </Provider>
  );

describe("AddressMapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders the default map and does not fetch without URL parameters", () => {
    mockSetSearchParams({});

    renderAddressMapper();

    expect(screen.getByTestId("map")).toHaveAttribute(
      "data-coordinates",
      JSON.stringify(defaultCoords)
    );

    expect(fetchHazardDataMock).not.toHaveBeenCalled();
  });

  it("fetches hazard data when URL parameters are present", async () => {
    const testCoords = [-122.4, 37.8];

    const mockData = {
      softStory: "data",
      tsunami: null,
      liquefaction: "data",
    };

    mockSetSearchParams({
      lat: "37.8",
      lon: "-122.4",
      address: "123 Main St",
    });

    fetchHazardDataMock.mockResolvedValue(mockData);

    renderAddressMapper();

    await waitFor(() => {
      expect(fetchHazardDataMock).toHaveBeenCalledWith(testCoords);
    });

    await waitFor(() => {
      const reportHazardsElements = screen
        .queryAllByTestId("report-hazards")
        .filter((element) => element.checkVisibility());

      expect(reportHazardsElements[0]).toHaveTextContent(
        JSON.stringify(mockData)
      );
    });
  });
});
