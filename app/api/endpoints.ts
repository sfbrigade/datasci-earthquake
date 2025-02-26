const API_URL = process.env.NEXT_PUBLIC_API_URL;
const CDN_URL = process.env.NEXT_PUBLIC_CDN_URL;

export const API_ENDPOINTS = {
  softStories: `${API_URL}/soft-stories`,
  tsunami: `${API_URL}/tsunami-zones`,
  liquefaction: `${API_URL}/liquefaction-zones`,
};

export const CDN_ENDPOINTS = {
  softStories: `${CDN_URL}/SoftStoryProperty.geojson`,
  tsunami: `${CDN_URL}/TsunamiZone.geojson`,
  liquefaction: `${CDN_URL}/LiquefactionZone.geojson`,
};