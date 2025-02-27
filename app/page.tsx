import "./globals.css";

import AddressMapper from "./components/address-mapper";
import { Headings } from "./data/data";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";

const Home = async () => {
  const headingData = Headings.home;
  const softStoryData = await fetchSoftStories();
  const tsunamiData = await fetchTsunami();
  const liquefactionData = await fetchLiquefaction();

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
