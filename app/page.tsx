import "./globals.css";

import AddressMapper from "./components/address-mapper";
import { Headings } from "./data/data";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";

const addressLookupCoordinates = {
  geometry: {
    type: "Point",
    coordinates: [-122.408020683, 37.801698301],
  },
};
const coords = addressLookupCoordinates.geometry.coordinates ?? [];

const Home = async () => {
  const headingData = Headings.home;

  const softStoryData = await fetchSoftStories();
  const tsunamiData = await fetchTsunami();
  const liquefactionData = await fetchLiquefaction();

  return (
    <AddressMapper
      coords={coords}
      headingData={headingData}
      softStoryData={softStoryData}
      tsunamiData={tsunamiData}
      liquefactionData={liquefactionData}
    />
  );
};

export default Home;
