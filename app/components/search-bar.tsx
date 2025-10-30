"use client";

import { ChangeEvent, FormEvent, Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import { chakra, Input, InputGroup, Text } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import DynamicAddressAutofill, {
  AddressAutofillOptions,
  AddressAutofillRetrieveResponse,
} from "./address-autofill";
import { AddressAutofillSuggestionResponse } from "@mapbox/search-js-core";

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
  onSearchChange: (coords: number[], address: string) => void;
}

const SearchBar = ({ onSearchChange }: SearchBarProps) => {
  const [inputAddress, setInputAddress] = useState("");
  const [suggestionSelected, setSuggestionSelected] = useState(false);
  const [suggestionsAvailable, setSuggestionsAvailable] = useState(false);
  const router = useRouter();
  const characterCap = 5;

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
    onSearchChange(coords, addressLine);
    // "locks in" choice, to prevent re-appearing of hint
    setSuggestionSelected(true);
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.currentTarget.value);
    // shows hint again upon further search param changes without selection of suggestion
    if (!suggestionSelected) setSuggestionsAvailable(false);
    else if (suggestionSelected && inputAddress.length <= 3) {
      setSuggestionSelected(false);
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
              base: "full",
              sm: "xs",
              md: "sm",
              lg: "md",
              // TODO: contrast new values to original values:
              // sm: 320px vs "303px"
              // md: 384px vs "371px",
              // lg: 448px vs "417px",
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
              placeholder="Search San Francisco address"
              fontFamily="body"
              fontSize={{
                base: "sm",
                sm: "md",
                md: "md",
                lg: "md",
              }}
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
        </DynamicAddressAutofill>
      </Suspense>
      {inputAddress.length && !suggestionSelected && !suggestionsAvailable ? (
        <Text
          position="absolute"
          bottom="-5"
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
