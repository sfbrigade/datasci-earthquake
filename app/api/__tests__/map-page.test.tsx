import Home from "../../(map)/page";
import Default from "../../(map)/default";
import {
  fetchFema,
  fetchLiquefaction,
  fetchSoftStories,
  fetchTsunami,
} from "../services";

jest.mock("../services", () => ({
  fetchFema: jest.fn(),
  fetchLiquefaction: jest.fn(),
  fetchSoftStories: jest.fn(),
  fetchTsunami: jest.fn(),
}));
jest.mock("@/components/address-mapper", () => ({
  __esModule: true,
  default: () => null,
}));
jest.mock("@chakra-ui/react", () => ({ Flex: "div" }));

const empty = { type: "FeatureCollection", features: [] };
beforeEach(() => {
  for (const loader of [
    fetchFema,
    fetchLiquefaction,
    fetchSoftStories,
    fetchTsunami,
  ]) {
    jest
      .mocked(loader)
      .mockReset()
      .mockResolvedValue(empty as Awaited<ReturnType<typeof fetchFema>>);
  }
});

test("main slot fallback retains the map page", () => {
  expect(Default).toBe(Home);
});

test("passes successful snapshots to the map", async () => {
  const page = await Home();
  expect(page.props.children.props.children.props.femaRiskData).toBe(empty);
});

test("one failed dataset fails the route instead of showing empty layers", async () => {
  const error = new Error(
    "Invalid map snapshot public/data/EarthquakeRisk.geojson"
  );
  jest.mocked(fetchFema).mockRejectedValue(error);
  await expect(Home()).rejects.toBe(error);
  await expect(Default()).rejects.toBe(error);
});
