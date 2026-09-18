import "server-only";
import { readFile } from "node:fs/promises";
import path from "node:path";
import type { FeatureCollection, Geometry } from "geojson";

// Map layers are pinned to this deployment, independently of browser API lookups.
const snapshotFiles = {
  softStories: "SoftStoryProperty.geojson",
  tsunami: "TsunamiZone.geojson",
  liquefaction: "LiquefactionZone.geojson",
  fema: "EarthquakeRisk.geojson",
} as const;

type Dataset = keyof typeof snapshotFiles;

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === "object" && value !== null && !Array.isArray(value);

const isPosition = (value: unknown): value is number[] =>
  Array.isArray(value) &&
  value.length >= 2 &&
  value.every(
    (coordinate) =>
      typeof coordinate === "number" && Number.isFinite(coordinate)
  );

const isRing = (value: unknown): boolean => {
  if (!Array.isArray(value) || value.length < 4 || !value.every(isPosition)) {
    return false;
  }
  const first = value[0];
  const last = value[value.length - 1];
  return first.length === last.length && first.every((n, i) => n === last[i]);
};

const isPolygon = (value: unknown): boolean =>
  Array.isArray(value) && value.length > 0 && value.every(isRing);

function validateSnapshot(
  data: unknown,
  dataset: Dataset
): asserts data is FeatureCollection<Geometry> {
  if (
    !isObject(data) ||
    data.type !== "FeatureCollection" ||
    !Array.isArray(data.features)
  ) {
    throw new Error(
      "expected a GeoJSON FeatureCollection with a features array"
    );
  }
  // Empty collections are valid; unreadable or invalid snapshots are not.
  for (const [index, feature] of data.features.entries()) {
    if (
      !isObject(feature) ||
      feature.type !== "Feature" ||
      !(feature.properties === null || isObject(feature.properties)) ||
      !isObject(feature.geometry)
    ) {
      throw new Error(`invalid feature at index ${index}`);
    }
    const geometry = feature.geometry;
    const validGeometry =
      dataset === "softStories"
        ? geometry.type === "Point" && isPosition(geometry.coordinates)
        : (geometry.type === "Polygon" && isPolygon(geometry.coordinates)) ||
          (geometry.type === "MultiPolygon" &&
            Array.isArray(geometry.coordinates) &&
            geometry.coordinates.length > 0 &&
            geometry.coordinates.every(isPolygon));
    if (!validGeometry) {
      throw new Error(`invalid ${dataset} geometry at feature ${index}`);
    }
    if (dataset === "fema") {
      const properties = feature.properties;
      if (
        !isObject(properties) ||
        typeof properties.tract_fips !== "string" ||
        !/^\d{11}$/.test(properties.tract_fips) ||
        !(
          properties.fema_risk_rating === null ||
          typeof properties.fema_risk_rating === "string"
        ) ||
        !(
          properties.fema_risk_score === null ||
          (typeof properties.fema_risk_score === "number" &&
            Number.isFinite(properties.fema_risk_score))
        )
      ) {
        throw new Error(
          `invalid FEMA tract/risk properties at feature ${index}`
        );
      }
    }
  }
}

export const fetchData = async (
  dataset: Dataset
): Promise<FeatureCollection<Geometry>> => {
  // Check at runtime too: callers must never supply paths or URLs.
  if (!Object.hasOwn(snapshotFiles, dataset)) {
    throw new Error("Unknown map snapshot dataset");
  }
  const filename = snapshotFiles[dataset];
  const filePath = path.join(process.cwd(), "public", "data", filename);
  let contents: string;
  try {
    contents = await readFile(filePath, "utf-8");
  } catch {
    throw new Error(
      `Unable to read required map snapshot public/data/${filename}`
    );
  }
  let data: unknown;
  try {
    data = JSON.parse(contents);
  } catch {
    throw new Error(`Invalid JSON in map snapshot public/data/${filename}`);
  }
  try {
    validateSnapshot(data, dataset);
  } catch (error) {
    throw new Error(
      `Invalid map snapshot public/data/${filename}: ${(error as Error).message}`
    );
  }
  return data;
};
