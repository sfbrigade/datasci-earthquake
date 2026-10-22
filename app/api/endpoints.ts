const API_URL = "/api";
const CDN_URL = ["ci", "local"].includes(process.env.ENVIRONMENT || "")
  ? "data"
  : process.env.NEXT_PUBLIC_CDN_URL;

export const API_ENDPOINTS = {
  softStories: `${API_URL}/soft-stories`,
  tsunami: `${API_URL}/tsunami-zones`,
  liquefaction: `${API_URL}/liquefaction-zones`,
  fema: `${API_URL}/fema`,
  landslide: `${API_URL}/landslide-zones`,
  isSoftStory: `${API_URL}/soft-stories/is-soft-story`,
  isInTsunamiZone: `${API_URL}/tsunami-zones/is-in-tsunami-zone`,
  isInLiquefactionZone: `${API_URL}/liquefaction-zones/is-in-liquefaction-zone`,
  getFemaZone: `${API_URL}/fema/get-fema-zone`,
  isInLandslideZone: `${API_URL}/landslide-zones/is-in-landslide-zone`,
};

export const CDN_ENDPOINTS = {
  softStories: `${CDN_URL}/SoftStoryProperty.geojson`,
  tsunami: `${CDN_URL}/TsunamiZone.geojson`,
  liquefaction: `${CDN_URL}/LiquefactionZone.geojson`,
  fema: `${CDN_URL}/EarthquakeRisk.geojson`,
  landslide: `${CDN_URL}/LandslideZone.geojson`,
};
