"use client";

import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { chakra, Input, InputGroup, Text } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { IoSearchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import DynamicAddressAutofill, {
  AddressAutofillOptions,
  AddressAutofillRetrieveResponse,
} from "./address-autofill";
import type { HazardData } from "./home-header";
import { AddressAutofillSuggestionResponse } from "@mapbox/search-js-core";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";

const autofillOptions: AddressAutofillOptions = {
  country: "US",
  limit: 10,
  bbox: [-122.55, 37.69, -122.35, 37.83],
  proximity: { lng: -122.4194, lat: 37.7749 },
  streets: false,
  language: "en",
};

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `search-bar-skeleton.tsx` and vice versa
// TODO: isolate the usage of `useSearchParams()` so that the Suspense boundary can be even more narrow if possible
interface SearchBarProps {
  coordinates: number[];
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
  onCoordDataRetrieve: (data: HazardData) => void;
  onHazardDataLoading: (hazardDataLoading: boolean) => void;
  onSearchComplete: (searchComplete: boolean) => void;
}

const SearchBar = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
  onHazardDataLoading,
  onSearchComplete,
}: SearchBarProps) => {
  const [inputAddress, setInputAddress] = useState("");
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const [suggestionsAvailable, setSuggestionsAvailable] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const characterCap = 5;

  const { fetchHazardData } = useHazardDataFetcher({
    onSearchComplete,
    onHazardDataLoading,
  });

  const handleClearClick = () => {
    setInputAddress("");
    setSuggestionSelected(false);
    router.push("/", { scroll: false });
  };

  // extract feature data (address, coordinates) from response and:
  // - update full address
  // - retrieve additional data about coordinates from our API
  // - retrieve associated coordinates from our API
  //
  // fired when the user has selected suggestion, before the form is autofilled (from https://docs.mapbox.com/mapbox-search-js/api/react/autofill/)
  const handleRetrieve = (res: AddressAutofillRetrieveResponse) => {
    const addressData = res.features[0];
    const addressLine = res.features[0].properties.feature_name;
    const coords = addressData.geometry.coordinates;

    onAddressSearch(addressLine);
    onSearchChange(coords);
    updateHazardData(coords);

    const newUrl = `?address=${encodeURIComponent(addressLine)}&lat=${coords[1]}&lon=${coords[0]}`;
    router.push(newUrl, { scroll: false });
    // "locks in" choice, to prevent re-appearing of hint
    setSuggestionSelected(true);
  };

  const updateHazardData = async (coords: number[]) => {
    try {
      const values = await fetchHazardData(coords);
      onCoordDataRetrieve(values);
    } catch (error) {
      console.error(
        "Error while retrieving data: ",
        error instanceof Error ? error.message : error?.toString()
      );
      onCoordDataRetrieve({
        softStory: null,
        tsunami: null,
        liquefaction: null,
      });
      toaster.create({
        description: "Could not retrieve hazard data",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.currentTarget.value);
    // shows hint again upon further search param changes without selection of suggestion
    if (!suggestionSelected) {
      setSuggestionsAvailable(false);
    }
  };

  /**
   * TODO: capture and update address on submit OR use first autocomplete suggestion; see file://./../snippets.md#geocode-on-search for details.
   */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    console.log("onSubmit", event.currentTarget.value);
    event.preventDefault();

    // TODO: capture and update address as described above
  };

  const handleSuggest = (res: AddressAutofillSuggestionResponse) => {
    setSuggestionsAvailable(res.suggestions.length > 0);
  };

  // temporary memoization fix for updating the address in the search bar.
  // TODO: refactor how we are caching our calls
  const memoizedOnSearchChange = useCallback(onSearchChange, []);
  const memoizedOnAddressSearch = useCallback(onAddressSearch, []);
  const memoizedUpdateHazardData = useCallback(updateHazardData, [
    fetchHazardData,
    onCoordDataRetrieve,
  ]);

  useEffect(() => {
    const address = searchParams.get("address");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (address && lat && lon) {
      const coords = [parseFloat(lon), parseFloat(lat)];
      memoizedOnAddressSearch(address);
      memoizedOnSearchChange(coords);
      memoizedUpdateHazardData(coords);
    }
  }, [
    searchParams,
    memoizedOnAddressSearch,
    memoizedOnSearchChange,
    memoizedUpdateHazardData,
  ]);

  return (
    <chakra.form position={"relative"} onSubmit={onSubmit}>
      <Suspense>
        <DynamicAddressAutofill
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""}
          options={autofillOptions}
          onRetrieve={handleRetrieve}
          // hides hint when suggestions are provided
          onSuggest={handleSuggest}
        >
          <InputGroup
            w={{
              base: "100%",
              sm: "303px",
              md: "371px",
              lg: "417px",
            }}
            mb={"24px"}
            data-testid="search-bar"
            startElement={
              <IoSearchSharp
                color="grey.900"
                fontSize="1.1em"
                size="20"
                data-testid="search-icon"
              />
            }
            endElement={
              inputAddress.length !== 0 && (
                <RxCross2
                  color="grey.900"
                  fontSize="1.1em"
                  size="20"
                  data-testid="clear-icon"
                  onClick={handleClearClick}
                />
              )
            }
          >
            <Input
              placeholder="Search San Francisco address"
              fontFamily="Inter, sans-serif"
              fontSize={{
                base: "sm",
                sm: "md",
                md: "md",
                lg: "md",
              }}
              size={{ base: "lg", md: "xl", xl: "xl" }}
              p={{
                base: "0 10px 0 35px",
                sm: "0 10px 0 35px",
                md: "0 10px 0 48px",
                lg: "0 10px 0 48px",
              }}
              borderRadius="full"
              border="1px solid #4A5568"
              bgColor="white"
              boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
              type="text"
              name="address-1"
              value={inputAddress}
              onChange={handleAddressChange}
              _focus={{ borderColor: "yellow" }}
              _hover={{
                borderColor: "yellow",
                _placeholder: { color: "grey.900" },
              }}
              _invalid={{ borderColor: "red" }}
              autoComplete="address-line1"
            />
          </InputGroup>
        </DynamicAddressAutofill>
      </Suspense>
      {inputAddress.length && !suggestionSelected && !suggestionsAvailable ? (
        <Text
          position="absolute"
          bottom={0}
          textStyle="textSmall"
          color="white"
        >
          {inputAddress.length < characterCap
            ? "Keep typing…"
            : "Try refining search…"}
        </Text>
      ) : null}
    </chakra.form>
  );
};

export default SearchBar;
