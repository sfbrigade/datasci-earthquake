import { renderHook, act } from "@testing-library/react";
import { useHazardDataFetcher } from "../../../hooks/useHazardDataFetcher";
import { toaster } from "@/components/ui/toaster";

const fetchMock = jest.fn();
global.fetch = fetchMock;

// mock for a successful fetch response
const mockSuccessResponse = (data: {
  exists: boolean;
  last_updated: string | null;
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
    return mockSuccessResponse({ exists: false, last_updated: null });
  });

  const onSearchComplete = jest.fn();
  const onHazardDataLoading = jest.fn();

  const { result } = renderHook(() =>
    useHazardDataFetcher({ onSearchComplete, onHazardDataLoading })
  );

  // Act to run the hook's async function
  let returnedValue;
  await act(async () => {
    returnedValue = await result.current.fetchHazardData([12, 34]);
  });

  // Assertions
  expect(onHazardDataLoading).toHaveBeenNthCalledWith(1, true);
  expect(onSearchComplete).toHaveBeenCalledWith(true);
  expect(toaster.create).not.toHaveBeenCalled();
  expect(onHazardDataLoading).toHaveBeenNthCalledWith(2, false);
  expect(fetchMock).toHaveBeenCalledTimes(3);

  expect(returnedValue).toEqual({
    softStory: { exists: false, last_updated: null },
    tsunami: { exists: false, last_updated: null },
    liquefaction: { exists: true, last_updated: "2025-08-05T17:03:03.555976Z" },
  });
});

test("should show a warning toast when one API call fails", async () => {
  // Setup
  // Mock fetch to succeed for first two calls and fail for the third(Liquefaction)
  fetchMock
    .mockResolvedValueOnce(
      mockSuccessResponse({ exists: false, last_updated: null })
    )
    .mockResolvedValueOnce(
      mockSuccessResponse({ exists: false, last_updated: null })
    )
    .mockResolvedValueOnce(mockFailedResponse());

  const onSearchComplete = jest.fn();
  const onHazardDataLoading = jest.fn();

  const { result } = renderHook(() =>
    useHazardDataFetcher({ onSearchComplete, onHazardDataLoading })
  );

  // Act to run the hook's async function
  let returnedValue;
  await act(async () => {
    returnedValue = await result.current.fetchHazardData([12, 34]);
  });

  // Assertions
  expect(onSearchComplete).toHaveBeenCalledWith(true);
  expect(toaster.create).toHaveBeenCalledWith(
    expect.objectContaining({
      title: "Hazard data warning",
      description: "Failed to fetch: Liquefaction",
    })
  );
  expect(onHazardDataLoading).toHaveBeenCalledTimes(2);
  expect(fetchMock).toHaveBeenCalledTimes(3);

  expect(returnedValue).toEqual({
    softStory: { exists: false, last_updated: null },
    tsunami: { exists: false, last_updated: null },
    liquefaction: null,
  });
});
