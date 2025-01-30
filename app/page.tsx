import React from "react";
import "./globals.css";
import PageSection from "./components/page-section";
import PageSectionMap from "./components/page-section-map";
import SearchBar from "./components/search-bar";
import Heading from "./components/heading";
import Map from "./components/map";
import FlexColumn from "./components/flex-column";
import Report from "./components/report";
import Information from "./components/information";
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

  // TODO: pass in padding for each page section
  return (
    <FlexColumn>
      <PageSection>
        <span style={{ display: "none" }}></span>
        <Heading headingData={headingData} />
        <SearchBar />
      </PageSection>
      <PageSection>
        <span style={{ display: "none" }}></span>
        {/* <Report /> */}
      </PageSection>
      <PageSectionMap>
        <Map coordinates={coords} />
      </PageSectionMap>
      <PageSection>
        <span style={{ display: "none" }}></span>
        <Information />
      </PageSection>
    </FlexColumn>
  );
};

export default Home;
