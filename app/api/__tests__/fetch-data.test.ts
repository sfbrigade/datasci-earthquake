import { readFile } from "node:fs/promises";
import { fetchData } from "../fetch-data";
import {
  fetchFema,
  fetchLiquefaction,
  fetchSoftStories,
  fetchTsunami,
} from "../services";

jest.mock("server-only", () => ({}), { virtual: true });
jest.mock("node:fs/promises", () => ({ readFile: jest.fn() }));
const read = jest.mocked(readFile);
const ring = [
  [0, 0],
  [1, 0],
  [1, 1],
  [0, 0],
];
const feature = {
  type: "Feature",
  geometry: { type: "Polygon", coordinates: [ring] },
  properties: {
    tract_fips: "06075012403",
    fema_risk_rating: null,
    fema_risk_score: 0,
  },
};
const collection = { type: "FeatureCollection", features: [feature] };
const originalEnv = { ...process.env };
const originalFetch = global.fetch;

beforeEach(() => {
  read.mockReset();
  global.fetch = jest.fn(() =>
    Promise.reject(new Error("HTTP must not be used"))
  );
});
afterEach(() => {
  process.env = { ...originalEnv };
  global.fetch = originalFetch;
});

test.each(
  ["ci", "local", "prod", "dev_docker", ""].flatMap((environment) =>
    ["1", ""].map((ci) => [environment, ci])
  )
)(
  "uses deployment snapshots with ENVIRONMENT=%s CI=%s regardless of CDN/API configuration",
  async (environment, ci) => {
    process.env.ENVIRONMENT = environment;
    process.env.CI = ci;
    process.env.NEXT_PUBLIC_CDN_URL = "https://unreachable.invalid/stale-data";
    process.env.NEXT_PUBLIC_API_URL = "https://another-deployment.invalid/api";
    read.mockResolvedValue(
      JSON.stringify({ type: "FeatureCollection", features: [] })
    );
    const result = await Promise.all([
      fetchSoftStories(),
      fetchTsunami(),
      fetchLiquefaction(),
      fetchFema(),
    ]);
    expect(result.every((data) => data.features.length === 0)).toBe(true);
    for (const filename of [
      "SoftStoryProperty",
      "TsunamiZone",
      "LiquefactionZone",
      "EarthquakeRisk",
    ]) {
      expect(read).toHaveBeenCalledWith(
        `${process.cwd()}/public/data/${filename}.geojson`,
        "utf-8"
      );
    }
    expect(global.fetch).not.toHaveBeenCalled();
  }
);

test("preserves tract identifiers, null ratings, and zero scores", async () => {
  read.mockResolvedValue(JSON.stringify(collection));
  expect(await fetchFema()).toEqual(collection);
  const nullable = structuredClone(collection);
  nullable.features[0].properties.fema_risk_score = null as unknown as number;
  read.mockResolvedValue(JSON.stringify(nullable));
  expect(await fetchFema()).toEqual(nullable);
});

test.each([
  ["not JSON", "Invalid JSON"],
  [JSON.stringify({ error: true }), "FeatureCollection"],
  [
    JSON.stringify({ type: "FeatureCollection", features: null }),
    "features array",
  ],
  [
    JSON.stringify({
      ...collection,
      features: [{ ...feature, geometry: null }],
    }),
    "invalid feature",
  ],
  [
    JSON.stringify({
      ...collection,
      features: [
        {
          ...feature,
          geometry: {
            type: "Polygon",
            coordinates: [
              [
                [0, 0],
                [1, 1],
              ],
            ],
          },
        },
      ],
    }),
    "geometry",
  ],
  [
    JSON.stringify({
      ...collection,
      features: [{ ...feature, properties: {} }],
    }),
    "properties",
  ],
  [
    JSON.stringify({
      ...collection,
      features: [
        {
          ...feature,
          properties: { ...feature.properties, fema_risk_score: "0" },
        },
      ],
    }),
    "properties",
  ],
])("rejects corrupt snapshots: %s", async (contents, message) => {
  read.mockResolvedValue(contents);
  await expect(fetchFema()).rejects.toThrow(message);
});

test("repeated concurrent failures settle, and subsequent reads can recover", async () => {
  read.mockRejectedValue(new Error("ENOENT"));
  for (let attempt = 0; attempt < 2; attempt++) {
    const results = await Promise.allSettled(
      Array.from({ length: 12 }, () => fetchFema())
    );
    expect(results.every((result) => result.status === "rejected")).toBe(true);
  }
  await expect(fetchFema()).rejects.toThrow(
    "required map snapshot public/data/EarthquakeRisk.geojson"
  );
  read.mockResolvedValue(JSON.stringify(collection));
  expect(await Promise.all([fetchFema(), fetchFema()])).toEqual([
    collection,
    collection,
  ]);
}, 2000);

test("rejects unallowlisted dataset identities before filesystem access", async () => {
  await expect(
    fetchData("../secret" as Parameters<typeof fetchData>[0])
  ).rejects.toThrow("Unknown map snapshot");
  expect(read).not.toHaveBeenCalled();
});

test("validates the actual deployment snapshots without rewriting them", async () => {
  const actual =
    jest.requireActual<typeof import("node:fs/promises")>("node:fs/promises");
  read.mockImplementation(actual.readFile);
  await Promise.all([
    fetchSoftStories(),
    fetchTsunami(),
    fetchLiquefaction(),
    fetchFema(),
  ]);
  expect(global.fetch).not.toHaveBeenCalled();
});
