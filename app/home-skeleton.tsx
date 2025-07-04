import "./globals.css";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import AddressMapper from "./components/address-mapper";
import { Headings } from "./data/data";

// TODO: move some of AddressMapper into this file, especially the static content like copy
const HomeSkeleton = () => {
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

  return (
    <AddressMapper
      headingData={headingData}
      softStoryData={softStoryData}
      tsunamiData={tsunamiData}
      liquefactionData={liquefactionData}
    />
  );
};

export default HomeSkeleton;
