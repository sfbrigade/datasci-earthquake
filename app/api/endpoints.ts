const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export const ENDPOINTS = {
  softStories: `${BASE_URL}/soft-stories/`,
  tsunami: `${BASE_URL}/tsunami-zones/`,
  liquefaction: `${BASE_URL}/liquefaction-zones/`,
};