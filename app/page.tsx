import "./globals.css";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";

import AddressMapper from "./components/address-mapper";
import { Headings } from "./data/data";
import {
  fetchSoftStories,
  fetchTsunami,
  fetchLiquefaction,
} from "./api/services";
import { useToast } from "@chakra-ui/react";

const Home = async () => {
  const headingData = Headings.home;
  const toast = useToast;
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
  } catch (error) {
    console.error("Error:", error);
    toast({
      description: "Could not retrieve data",
      status: "error",
      duration: 5000,
      isClosable: true,
      position: "top",
      containerStyle: {
        backgroundColor: "#b53d37",
        opacity: 1,
        borderRadius: "12px",
      },
    });
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
