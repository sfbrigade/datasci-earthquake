"use client";

import SearchBar from "../components/search-bar";

const SearchBarClientWrapper = ({}) => (
  <SearchBar
    coordinates={[0, 0]}
    onSearchChange={() => {}}
    onAddressSearch={() => {}}
    onCoordDataRetrieve={() => {}}
    onHazardDataLoading={() => {}}
    onSearchComplete={() => {}}
  />
);

export default SearchBarClientWrapper;
