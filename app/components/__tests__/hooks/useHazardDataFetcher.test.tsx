import { renderHook, act } from "@testing-library/react";
import { useHazardDataFetcher } from "../../../hooks/useHazardDataFetcher";
import { toaster } from "@/components/ui/toaster";

const fetchMock = jest.fn();
global.fetch = fetchMock;

const femaRisk = {
  exists: true,
  last_updated: "2025-08-05T17:03:03.555976Z",
  risk_rating: "Very High",
  risk_score: 98.78,
};

const landslide = { exists: true, last_updated: null, gridcode: 10 };

// mock for a successful fetch response
const mockSuccessResponse = (data: {
  exists: boolean;
  last_updated: string | null;
  gridcode?: number | null;
}) =>
  Promise.resolve({
    ok: true,
    json: () => Promise.resolve(data),
  });

// mock for a failed fetch response
const mockFailedResponse = () =>
  Promise.resolve({
    ok: false,
    status: 500,
    statusText: "Internal Server Error",
    text: () => Promise.resolve("Internal Server Error"),
  });

// Mock the toaster component
jest.mock("@/components/ui/toaster", () => ({
  toaster: {
    create: jest.fn(),
    isVisible: jest.fn(() => false),
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
  fetchMock.mockReset();
});

test("should fetch all hazard data successfully", async () => {
  // Setup
  fetchMock.mockImplementation((url) => {
    if (url.includes("soft-story")) {
      return mockSuccessResponse({ exists: false, last_updated: null });
    }
    if (url.includes("tsunami")) {
      return mockSuccessResponse({ exists: false, last_updated: null });
    }
    if (url.includes("liquefaction")) {
      return mockSuccessResponse({
        exists: true,
        last_updated: "2025-08-05T17:03:03.555976Z",
      });
    }
    if (url.includes("get-fema-zone")) {
      return mockSuccessResponse(femaRisk);
    }
    if (url.includes("landslide")) {
      return mockSuccessResponse(landslide);
    }
    throw new Error(`Unexpected fetch URL: ${url}`);
  });

  const setSearchComplete = jest.fn();
  const setHazardDataLoading = jest.fn();

  const { result } = renderHook(() =>
    useHazardDataFetcher({ setSearchComplete, setHazardDataLoading })
  );

  // Act to run the hook's async function
  let returnedValue;
  await act(async () => {
    returnedValue = await result.current.fetchHazardData([12, 34]);
  });

  // Assertions
  expect(setHazardDataLoading).toHaveBeenNthCalledWith(1, true);
  expect(setSearchComplete).toHaveBeenCalledWith(true);
  expect(toaster.create).not.toHaveBeenCalled();
  expect(setHazardDataLoading).toHaveBeenNthCalledWith(2, false);
  expect(fetchMock).toHaveBeenCalledTimes(5);
  expect(fetchMock).toHaveBeenCalledWith(
    "/api/fema/get-fema-zone?lon=12&lat=34"
  );

  expect(returnedValue).toEqual({
    softStory: { exists: false, last_updated: null },
    tsunami: { exists: false, last_updated: null },
    liquefaction: { exists: true, last_updated: "2025-08-05T17:03:03.555976Z" },
    femaRisk,
    landslide,
  });
});

test("should show a warning toast when one API call fails", async () => {
  // Setup
  // Only the third call (Liquefaction) fails; FEMA and landslide data still succeed.
  fetchMock
    .mockResolvedValueOnce(
      mockSuccessResponse({ exists: false, last_updated: null })
    )
    .mockResolvedValueOnce(
      mockSuccessResponse({ exists: false, last_updated: null })
    )
    .mockResolvedValueOnce(mockFailedResponse())
    .mockResolvedValueOnce(mockSuccessResponse(femaRisk))
    .mockResolvedValueOnce(mockSuccessResponse(landslide));

  const setSearchComplete = jest.fn();
  const setHazardDataLoading = jest.fn();

  const { result } = renderHook(() =>
    useHazardDataFetcher({ setSearchComplete, setHazardDataLoading })
  );

  // Act to run the hook's async function
  let returnedValue;
  await act(async () => {
    returnedValue = await result.current.fetchHazardData([12, 34]);
  });

  // Assertions
  expect(setSearchComplete).toHaveBeenCalledWith(true);
  expect(toaster.create).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Hazard data warning",
      description: "Failed to fetch: Liquefaction",
    })
  );
  expect(setHazardDataLoading).toHaveBeenCalledTimes(2);
  expect(fetchMock).toHaveBeenCalledTimes(5);

  expect(returnedValue).toEqual({
    softStory: { exists: false, last_updated: null },
    tsunami: { exists: false, last_updated: null },
    liquefaction: null,
    femaRisk,
    landslide,
  });
});
