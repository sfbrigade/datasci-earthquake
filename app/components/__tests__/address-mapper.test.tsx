import React from "react";
import { act, render, waitFor, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import { ChakraProvider } from "@chakra-ui/react";

const fetchHazardDataMock = jest.fn();
const mockGet = jest.fn();

jest.mock("../../hooks/useHazardDataFetcher", () => ({
  useHazardDataFetcher: jest.fn(() => ({
    fetchHazardData: fetchHazardDataMock,
  })),
}));

jest.mock("next/navigation", () => ({
  useSearchParams: jest.fn(() => ({
    get: mockGet,
  })),
}));

jest.mock("../home-header", () => {
  const mockComponent = jest.fn((props) => (
    <div data-testid="home-header">Mock HomeHeader</div>
  ));

  return {
    __esModule: true,
    default: mockComponent,
  };
});

jest.mock("../map", () => {
  return jest.fn((props) => (
    <div data-testid="map" data-coordinates={JSON.stringify(props.coordinates)}>
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

import * as HomeHeaderModule from "../home-header";
const MockedHomeHeader = jest.mocked(HomeHeaderModule).default;
import AddressMapper from "../address-mapper";

const mockSetSearchParams = (params: Record<string, string>) => {
  mockGet.mockImplementation((key) => params[key] || null);
};

const defaultCoords = [-122.408020683, 37.801698301];
const mockFeatureCollection = {
  type: "FeatureCollection" as const,
  features: [],
};
const mockProps = {
  softStoryData: mockFeatureCollection,
  tsunamiData: mockFeatureCollection,
  liquefactionData: mockFeatureCollection,
};

describe("AddressMapper", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should render with default state and not fetch data on initial load without URL params", async () => {
    // Arrange
    mockSetSearchParams({});

    // Act
    render(
      <ChakraProvider>
        <AddressMapper {...mockProps} />
      </ChakraProvider>
    );

    // Assert
    expect(screen.getByTestId("map")).toHaveAttribute(
      "data-coordinates",
      JSON.stringify(defaultCoords)
    );
    expect(fetchHazardDataMock).not.toHaveBeenCalled();
  });

  it("should fetch data when loaded with URL parameters", async () => {
    // Arrange
    const testCoords = [-122.4, 37.8];
    const testAddress = "123 Main St";
    const mockData = { softStory: "data", tsunami: null, liquefaction: "data" };
    mockSetSearchParams({ lat: "37.8", lon: "-122.4", address: testAddress });
    fetchHazardDataMock.mockResolvedValue(mockData);

    // Act
    render(
      <ChakraProvider>
        <AddressMapper {...mockProps} />
      </ChakraProvider>
    );

    // Assert
    await waitFor(() => {
      expect(fetchHazardDataMock).toHaveBeenCalledWith(testCoords);
      expect(screen.getByTestId("report-hazards")).toHaveTextContent(
        JSON.stringify(mockData)
      );
    });
  });

  it("should trigger a data fetch when setCoordinates is called from a user action", async () => {
    // Arrange
    const newCoords = [-120.0, 35.0];
    const mockData = { softStory: "data", tsunami: null, liquefaction: "data" };
    fetchHazardDataMock.mockResolvedValue(mockData);

    // Act
    render(
      <ChakraProvider>
        <AddressMapper {...mockProps} />
      </ChakraProvider>
    );
    await act(async () => {
      const homeHeaderProps = MockedHomeHeader.mock.calls[0][0];
      homeHeaderProps.onSearchChange(newCoords);
    });

    // Assert
    await waitFor(() => {
      expect(fetchHazardDataMock).toHaveBeenCalledWith(newCoords);
      expect(screen.getByTestId("report-hazards")).toHaveTextContent(
        JSON.stringify(mockData)
      );
    });
  });
});
