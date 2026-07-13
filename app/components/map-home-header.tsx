"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import HomeHeader from "./home-header";
import SearchBar from "./search-bar";
import { useMapState } from "./map-state-provider";

const MapHomeHeader = () => {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();

  const searchedAddress = searchParams.get("address");
  const longitude = searchParams.get("lon");
  const latitude = searchParams.get("lat");

  const hasValidSearch = Boolean(searchedAddress && longitude && latitude);

  const [inputAddress, setInputAddress] = useState(searchedAddress ?? "");

  const { isSearchComplete, setSearchComplete } = useMapState();

  /*
   * The map layout persists while navigating between "/", "/prepare",
   * and "/about". Synchronize the input when the URL's selected address
   * actually changes, including browser back/forward navigation.
   *
   * Do not depend on pathname here. Opening a panel should not mark the
   * existing map search as incomplete.
   */
  // useEffect(() => {
  //   // setInputAddress(searchedAddress ?? "");
  //   setSearchComplete(false);
  // }, [searchedAddress, longitude, latitude, setSearchComplete]);

  const handleSearchChange = useCallback(
    (coords: number[], address: string) => {
      const params = new URLSearchParams(searchParams.toString());

      params.set("address", address);
      params.set("lon", coords[0].toString());
      params.set("lat", coords[1].toString());

      setInputAddress(address);
      setSearchComplete(false);

      router.push(`${pathname}?${params.toString()}`, {
        scroll: false,
      });
    },
    [pathname, router, searchParams, setSearchComplete]
  );

  const handleHomeIconClick = useCallback(() => {
    setInputAddress("");
    setSearchComplete(false);
  }, [setSearchComplete]);

  return (
    <HomeHeader
      searchedAddress={searchedAddress}
      isSearchComplete={hasValidSearch && isSearchComplete}
      onHomeIconClick={handleHomeIconClick}
      queryString={searchParams.toString()}
    >
      <SearchBar
        inputAddress={inputAddress}
        onInputAddressChange={setInputAddress}
        onSearchChange={handleSearchChange}
      />
    </HomeHeader>
  );
};

export default MapHomeHeader;
