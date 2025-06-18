"use client";

import { Suspense } from "react";
import { Input, InputGroup } from "@chakra-ui/react";
import { toaster } from "@/components/ui/toaster";
import { IoSearchSharp } from "react-icons/io5";
import DynamicAddressAutofill from "./address-autofill";
import {
  AddressAutofillRetrieveResponse,
  LngLatBounds,
} from "@mapbox/search-js-core";

const autofillOptions = {
  country: "US",
  limit: 10,
  bbox: new LngLatBounds([-122.55, 37.69], [-122.35, 37.83]),
  proximity: { lng: -122.4194, lat: 37.7749 },
  streets: false,
};

const inputAddress = "";

interface SearchBar2Props {
  coordinates: number[];
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
  onCoordDataRetrieve: (data: {
    softStory: any[] | null;
    tsunami: any[] | null;
    liquefaction: any[] | null;
  }) => void;
  onHazardDataLoading: (isLoading: boolean) => void;
  onSearchComplete: (searchComplete: boolean) => void;
}

const SearchBar2 = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
  onHazardDataLoading,
  onSearchComplete,
}: SearchBar2Props) => {
  const toastIdFailedHazardData = "failed-hazard-data";

  // const handleClearClick = () => {
  //   setInputAddress("");
  //   router.push("/", { scroll: false });
  // };

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
    // router.push(newUrl, { scroll: false });
  };

  const updateHazardData = async (coords: number[]) => {
    try {
      const values = await getHazardData(coords);
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

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.currentTarget.value);
  };

  // /**
  //  * TODO: capture and update address on submit OR use first autocomplete suggestion; see file://./../snippets.md#geocode-on-search for details.
  //  */
  // const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
  //   // console.log("onSubmit", event.currentTarget.value);
  //   // event.preventDefault();

  //   // TODO: capture and update address as described above
  // };

  return (
    // <form onSubmit={onSubmit}>
    <form>
      <InputGroup
        w={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
        mb={"24px"}
        data-testid="search-bar"
        startElement={
          <IoSearchSharp
            color="grey.900"
            fontSize="1.1em"
            data-testid="search-icon"
          />
        }
      >
        <Suspense>
          <DynamicAddressAutofill
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""}
            options={autofillOptions}
            onRetrieve={handleRetrieve}
          >
            <Input
              placeholder="Search San Francisco address"
              fontFamily="Inter, sans-serif"
              fontSize={{ base: "md", sm: "md", md: "md", lg: "md" }}
              size={{ base: "md", md: "lg", xl: "lg" }}
              p={{
                base: "0 10px 0 35px",
                sm: "0 10px 0 35px",
                md: "0 10px 0 48px",
                lg: "0 10px 0 48px",
              }}
              borderRadius="50"
              border="1px solid #4A5568"
              bgColor="white"
              boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
              type="text"
              name="address-1"
              value={inputAddress}
              onChange={handleAddressChange}
              _hover={{
                borderColor: "yellow",
                _placeholder: { color: "grey.900" },
              }}
              _invalid={{ borderColor: "red" }}
              autoComplete="address-line1"
            />
          </DynamicAddressAutofill>
        </Suspense>
      </InputGroup>
    </form>
  );
};

export default SearchBar2;
