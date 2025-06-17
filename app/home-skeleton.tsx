import "./globals.css";
import { FeatureCollection, GeoJsonProperties, Geometry } from "geojson";
import AddressMapper from "./components/address-mapper";

// TODO: move some of AddressMapper into this file, especially the static content like copy
const HomeSkeleton = () => {
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
      softStoryData={softStoryData}
      tsunamiData={tsunamiData}
      liquefactionData={liquefactionData}
    />
  );
};

export default HomeSkeleton;
