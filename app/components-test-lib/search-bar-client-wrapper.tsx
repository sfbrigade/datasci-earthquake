"use client";

import SearchBar from "../components/search-bar";

// NOTE: SearchBar resides here instead of directly in the components test library because event handlers are not allowed to be passed into a Client Component from a Server Component
const SearchBarClientWrapper = ({}) => <SearchBar onSearchChange={() => {}} />;

export default SearchBarClientWrapper;
