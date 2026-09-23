import fs from "fs";
import path from "path";

import { fetchData } from "../fetch-data";

describe("fetchData", () => {
  const originalEnvironment = process.env.ENVIRONMENT;
  const originalVercelEnv = process.env.VERCEL_ENV;
  const hadFetch = "fetch" in globalThis;
  const originalFetch = globalThis.fetch;

  afterEach(() => {
    if (originalEnvironment === undefined) {
      delete process.env.ENVIRONMENT;
    } else {
      process.env.ENVIRONMENT = originalEnvironment;
    }

    if (originalVercelEnv === undefined) {
      delete process.env.VERCEL_ENV;
    } else {
      process.env.VERCEL_ENV = originalVercelEnv;
    }

    if (hadFetch) {
      Object.defineProperty(globalThis, "fetch", {
        value: originalFetch,
        configurable: true,
        writable: true,
      });
    } else {
      Reflect.deleteProperty(globalThis, "fetch");
    }

    jest.restoreAllMocks();
  });

  it("uses the bundled GeoJSON during Vercel Preview builds", async () => {
    process.env.ENVIRONMENT = "prod";
    process.env.VERCEL_ENV = "preview";

    const snapshot = { type: "FeatureCollection", features: [] };
    const readFileSpy = jest
      .spyOn(fs.promises, "readFile")
      .mockResolvedValue(JSON.stringify(snapshot) as never);
    const fetchMock = jest.fn();
    Object.defineProperty(globalThis, "fetch", {
      value: fetchMock,
      configurable: true,
      writable: true,
    });

    await expect(
      fetchData(
        "https://develop.safehome.report/data/EarthquakeRisk.geojson",
        "/api/fema"
      )
    ).resolves.toEqual(snapshot);

    expect(readFileSpy).toHaveBeenCalledWith(
      path.join(process.cwd(), "public", "data", "EarthquakeRisk.geojson"),
      "utf-8"
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
