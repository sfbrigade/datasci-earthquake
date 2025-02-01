import { fetchData } from "./fetch-data";
import { ENDPOINTS } from "./endpoints";

export const fetchSoftStories = async () => fetchData(ENDPOINTS.softStories);

export const fetchTsunami = async () => fetchData(ENDPOINTS.tsunami);

export const fetchLiquefaction = async () => fetchData(ENDPOINTS.liquefaction);