import { fetchData } from "./fetch-data";
import { API_ENDPOINTS, CDN_ENDPOINTS } from "./endpoints";

export const fetchSoftStories = async () => fetchData(CDN_ENDPOINTS.softStories, API_ENDPOINTS.softStories);

export const fetchTsunami = async () => fetchData(CDN_ENDPOINTS.tsunami, API_ENDPOINTS.tsunami);

export const fetchLiquefaction = async () => fetchData(CDN_ENDPOINTS.liquefaction, API_ENDPOINTS.liquefaction);