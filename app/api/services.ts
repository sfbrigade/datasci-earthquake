import "server-only";
import { fetchData } from "./fetch-data";

export const fetchSoftStories = async () => fetchData("softStories");

export const fetchTsunami = async () => fetchData("tsunami");

export const fetchLiquefaction = async () => fetchData("liquefaction");

export const fetchFema = async () => fetchData("fema");
