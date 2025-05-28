const isClient = typeof window !== "undefined";

const getBaseUrl = (type: "api" | "cdn") => {
  if (isClient) {
    const isLocalhost = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocalhost) {
      return type === "api" ? "http://localhost:8000/api" : "http://localhost:3000/data";
    }
    return `${window.location.protocol}//${window.location.host}/${type}`;
  }
  return type === "api"
    ? process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api"
    : process.env.NEXT_PUBLIC_CDN_URL || "http://localhost:3000/data";
};

const API_URL = getBaseUrl("api");
const CDN_URL = getBaseUrl("cdn");

export const API_ENDPOINTS = {
  softStories: `${API_URL}/soft-stories`,
  tsunami: `${API_URL}/tsunami-zones`,
  liquefaction: `${API_URL}/liquefaction-zones`,
  isSoftStory: `${API_URL}/soft-stories/is-soft-story`,
  isInTsunamiZone: `${API_URL}/tsunami-zones/is-in-tsunami-zone`,
  isInLiquefactionZone: `${API_URL}/liquefaction-zones/is-in-liquefaction-zone`,
};

export const CDN_ENDPOINTS = {
  softStories: `${CDN_URL}/SoftStoryProperty.geojson`,
  tsunami: `${CDN_URL}/TsunamiZone.geojson`,
  liquefaction: `${CDN_URL}/LiquefactionZone.geojson`,
};