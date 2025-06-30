export type CoordinateData = {
  liquefaction: {exists: boolean; last_updated: string | null} | null;
  softStory: {exists: boolean; last_updated: string | null} | null;
  tsunami: {exists: boolean; last_updated: string | null} | null;
};