"use client";

import { Suspense } from "react";
import SearchBar from "../components/search-bar";
import SearchBarSkeleton from "../components/search-bar-skeleton";

// NOTE: SearchBar resides here instead of directly in the components test library because event handlers are not allowed to be passed into a Client Component from a Server Component
const SearchBarClientWrapper = ({}) => (
  <Suspense fallback={<SearchBarSkeleton />}>
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
