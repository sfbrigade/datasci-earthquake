"use client";

import { Suspense } from "react";
import SearchBar from "../components/search-bar";
import SearchBarSkeleton from "../components/search-bar-skeleton";

// NOTE: SearchBar resides here instead of directly in the components test library because event handlers are not allowed to be passed into a Client Component from a Server Component
const SearchBarClientWrapper = ({}) => (
  <Suspense fallback={<SearchBarSkeleton />}>
    {/* NOTE: This Suspense boundary is being used around a component that utilizes `useSearchParams()` to prevent entire page from deopting into client-side rendering (CSR) bailout as per https://nextjs.org/docs/messages/missing-suspense-with-csr-bailout */}
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
