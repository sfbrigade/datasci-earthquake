"use client";

import { Suspense } from "react";
import SearchBar from "../components/search-bar";

const SearchBarClientWrapper = ({}) => (
  <Suspense>
    <SearchBar
      coordinates={[0, 0]}
      onSearchChange={() => {}}
      onAddressSearch={() => {}}
      onCoordDataRetrieve={() => {}}
      onHazardDataLoading={() => {}}
      onSearchComplete={() => {}}
    />
  </Suspense>
);

export default SearchBarClientWrapper;
