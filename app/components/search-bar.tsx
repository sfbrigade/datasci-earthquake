"use client";

import { ChangeEvent, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { chakra, Input, InputGroup } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import DynamicAddressAutofill, {
  AddressAutofillOptions,
  AddressAutofillRetrieveResponse,
} from "./address-autofill";
import { AddressAutofillSuggestionResponse } from "@mapbox/search-js-core";
import { Tooltip } from "./ui/tooltip";

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
  inputAddress: string;
  onInputAddressChange: (address: string) => void;
  onSearchChange: (coords: number[], address: string) => void;
}

const SearchBar = ({
  inputAddress,
  onInputAddressChange,
  onSearchChange,
}: SearchBarProps) => {
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const [suggestionCount, setSuggestionCount] = useState<number | null>(null);
  const router = useRouter();
  const minimumAutocompleteLength = 3;

  const isBelowAutocompleteMinimum =
    inputAddress.length < minimumAutocompleteLength;
  const searchHint = isBelowAutocompleteMinimum
    ? `Keep typing — enter at least ${minimumAutocompleteLength} characters.`
    : "Try refining your search.";
  const showSearchHint = Boolean(
    inputAddress.length &&
    !suggestionSelected &&
    (isBelowAutocompleteMinimum || suggestionCount === 0)
  );

  const handleClearClick = () => {
    onInputAddressChange("");
    setSuggestionSelected(false);
    setSuggestionCount(null);
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
    onSearchChange(coords, addressLine);
    // "locks in" choice, to prevent re-appearing of hint
    setSuggestionSelected(true);
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextInputAddress = event.currentTarget.value;

    onInputAddressChange(nextInputAddress);
    // wait for a response for new value before showing refinement hint
    setSuggestionCount(null);
    if (
      suggestionSelected &&
      nextInputAddress.length <= minimumAutocompleteLength
    ) {
      setSuggestionSelected(false);
    }
  };

  // TODO: consider also capturing/updating address on submit OR using first autocomplete suggestion; see file://./../snippets.md#geocode-on-search for details.

  const handleSuggest = (res: AddressAutofillSuggestionResponse) => {
    setSuggestionCount(res.suggestions.length);
  };
  const handleSubmit = (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
  };

  return (
    <chakra.form position={"relative"} onSubmit={handleSubmit}>
      <Suspense>
        <DynamicAddressAutofill
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""}
          options={autofillOptions}
          onRetrieve={handleRetrieve}
          // hides hint when suggestions are provided
          onSuggest={handleSuggest}
        >
          <Tooltip
            content={searchHint}
            open={showSearchHint}
            openDelay={500}
            closeDelay={200}
            showArrow
            positioning={{
              placement: "bottom-start",
              offset: { mainAxis: -12 },
            }}
          >
            <InputGroup
              w={{
                base: "full",
                sm: "xs",
                md: "sm",
              }}
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
                autoFocus
                placeholder="Search San Francisco address"
                fontFamily="body"
                fontSize="md"
                size={{ base: "lg", md: "xl", xl: "xl" }}
                pt="0"
                pr="2.5"
                pb="0"
                pl={{ base: "9", md: "12" }}
                borderRadius="full"
                border="search"
                bgColor="white"
                shadow="search"
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
          </Tooltip>
        </DynamicAddressAutofill>
      </Suspense>
    </chakra.form>
  );
};

export default SearchBar;
