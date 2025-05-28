import "./globals.css";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

import AddressMapper from "./components/address-mapper";
import { Headings } from "./data/data";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";

// Force server-side rendering
export const dynamic = 'force-dynamic';

const Home = async () => {
  console.log("VERCEL_URL PAGE:", process.env.VERCEL_URL);
  console.log("Window: ", typeof window);
  const headingData = Headings.home;
  let softStoryData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };
  let tsunamiData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };
  let liquefactionData: FeatureCollection<Geometry, GeoJsonProperties> = {
    type: "FeatureCollection",
    features: [],
  };

  try {
    [softStoryData, tsunamiData, liquefactionData] = await Promise.all([
      fetchSoftStories(),
      fetchTsunami(),
      fetchLiquefaction(),
    ]);
  } catch (error: any) {
    console.error("Error: ", error);
  }
  return (
    <AddressMapper
      headingData={headingData}
      softStoryData={softStoryData}
      tsunamiData={tsunamiData}
      liquefactionData={liquefactionData}
    />
  );
};

export default Home;
