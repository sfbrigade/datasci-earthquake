import { useCallback } from "react";
import { toaster } from "@/components/ui/toaster";
import { API_ENDPOINTS } from "../api/endpoints";

const safeJsonFetch = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text(); // capture any error response
    throw new Error(
      `HTTP ${res.status} - ${res.statusText} | ${text} | URL: ${url}`
    );
  }
  return res.json();
};

interface UseHazardDataFetcherProps {
  onSearchComplete: (success: boolean) => void;
  onHazardDataLoading: (loading: boolean) => void;
}

export function useHazardDataFetcher({
  onSearchComplete,
  onHazardDataLoading,
}: UseHazardDataFetcherProps) {
  const toastIdFailedHazardData = "failed-hazard-data";

  // gets metadata from Mapbox API for given coordinates
  const fetchHazardData = useCallback(
    async (coords: number[]) => {
      onHazardDataLoading(true);

      const buildUrl = (endpoint: string) =>
        `${endpoint}?lon=${coords[0]}&lat=${coords[1]}`;

      try {
        const [softStory, tsunamiZone, liquefactionZone] =
          await Promise.allSettled([
            safeJsonFetch(buildUrl(API_ENDPOINTS.isSoftStory)),
            safeJsonFetch(buildUrl(API_ENDPOINTS.isInTsunamiZone)),
            safeJsonFetch(buildUrl(API_ENDPOINTS.isInLiquefactionZone)),
          ]);

        onSearchComplete(true);

        const failed = [
          { name: "Soft Story", result: softStory },
          { name: "Tsunami", result: tsunamiZone },
          { name: "Liquefaction", result: liquefactionZone },
        ].filter(({ result }) => result.status === "rejected");

        if (failed.length > 0) {
          if (!toaster.isVisible(toastIdFailedHazardData)) {
            toaster.create({
              id: toastIdFailedHazardData,
              title: "Hazard data warning",
              description: `Failed to fetch: ${failed
                .map((f) => f.name)
                .join(", ")}`,
              type: "warning",
              duration: 5000,
              closable: true,
            });
          }
        }

        return {
          softStory: softStory.status === "fulfilled" ? softStory.value : null,
          tsunami:
            tsunamiZone.status === "fulfilled" ? tsunamiZone.value : null,
          liquefaction:
            liquefactionZone.status === "fulfilled"
              ? liquefactionZone.value
              : null,
        };
      } catch (error) {
        console.error("Error fetching hazard data:", error);
        throw error;
      } finally {
        onHazardDataLoading(false);
      }
    },
    [onHazardDataLoading, onSearchComplete]
  );

  return {
    fetchHazardData,
  };
}
