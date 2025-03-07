"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import {
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import DynamicAddressAutofill from "./address-autofill";
import { ENDPOINTS } from "../api/endpoints";

/*
- bbox((string | LngLatBoundsLike)): Limit results to only those contained within the supplied bounding box.
- country(string): An ISO 3166 alpha-2 country code to be returned. If not specified, results will not be filtered by country.
- language(string): The IETF language tag to be returned. If not specified, en will be used.
- limit((string | number)): The number of results to return, up to 10 .
- proximity((string | LngLatLike)): Bias the response to favor results that are closer to this location. Provide a point coordinate provided as a LngLatLike , or use the string ip to use the requester's IP address.
- streets((string | boolean)): If enabled, street results may be returned in addition to addresses. Defaults to true .
*/
const options = {
  bbox: [
    [-122.6, 37.65], // Southwest coordinates
    [-122.25, 37.85], // Northeast coordinates
  ],
  country: "US",
  limit: 10,
  // proximity: , // TODO: consider passing in current center of map
  streets: false,
};

const SearchBar = ({ coordinates, onSearchChange }) => {
  const [address, setAddress] = useState("");
  const debug = useSearchParams().get("debug");

  // fires when X button in search box is clicked
  const handleClearClick = () => {
    setAddress("");
  };

  /*
    # User flow
    user types into search box
    mapbox API is called with search term to retrieve suggestions (which contain full address AND coordinates)
    suggestions show
    a) user selects suggestion
        full address AND coordinates are extracted from selected suggestion
        UI is updated to reflect address
        our API is called with coordinates to retrieve metadata
        cards are updated with metadata
    b) user presses enter (effectively ignoring suggestions) ... do we even handle this?
        - should we prevent enter?
        - google maps will sometimes select the first option
        - show an info box? -Merlin
        - placeholder label "Type address and select below"
        - highlight first option?
        - do nothing
  */

  // fired when the user has selected suggestion, before the form is autofilled (from https://docs.mapbox.com/mapbox-search-js/api/react/autofill/)
  //
  // extract feature data (address, coordinates) from response and:
  // - update full address
  // - retrieve additional data about coordinates from our API
  // //- retrieve associated coordinates from our API
  const handleRetrieve = (event) => {
    const addressData = event.features[0];
    const coords = addressData.geometry.coordinates;
    onSearchChange(coords);
    getCoordData(coords).then((values) => console.log("values", values));
    // TODO: use the values to update the hazard cards
    // TODO: grab resolved address as well to update rest of UI
  };

  // will be called every time the user types or modifies the input value in the search box (and loses focus?)
  //
  // retrieve coordinates from Mapbox API by providing full address
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  // (gets fired when user presses enter (or if there was a submit button, when the user clicks it))
  //
  // see part b of comment above; do we even need to handle pressing enter?
  // update coordinates
  const onSubmit = async (event) => {
    console.log("onSubmit", event.target.value);
    event.preventDefault();

    // TODO: capture address on submit OR use first autocomplete suggestion
    // const fullAddress = event.target.value;

    // try {
    //   const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
    //   const response = await fetch(url);
    //   const response_data = await response.json();

    //   if (
    //     response_data &&
    //     response_data.features &&
    //     response_data.features.length > 0
    //   ) {
    //     onSearchChange(response_data.features[0].center);
    //     // TODO: grab resolved address as well to update rest of UI
    //   }
    // } catch (err) {
    //   console.log(err);
    // }
  };

  // gets metadata from Mapbox API for given coordinates
  const getCoordData = (coords = coordinates) => {
    // TODO: convert from promises to async/await
    // Send coordinates to the backend
    const isSoftStory = fetch(
      `${ENDPOINTS.isSoftStory}?lon=${coords[0]}&lat=${coords[1]}`
    ).then((response) => response.json());

    const isInTsunamiZone = fetch(
      `${ENDPOINTS.isInTsunamiZone}?lon=${coords[0]}&lat=${coords[1]}`
    ).then((response) => response.json());

    const isInLiquefactionZone = fetch(
      `${ENDPOINTS.isInLiquefactionZone}?lon=${coords[0]}&lat=${coords[1]}`
    ).then((response) => response.json());

    return Promise.all([isSoftStory, isInTsunamiZone, isInLiquefactionZone]);
  };

  return (
    <form onSubmit={onSubmit}>
      {debug === "true" && (
        <HStack>
          <NumberInput
            bg="white"
            size="xs"
            width="auto"
            defaultValue={coordinates[0]}
            precision={9}
            step={0.005}
            onChange={(valueString) =>
              onSearchChange([parseFloat(valueString), coordinates[1]])
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
          <NumberInput
            bg="white"
            size="xs"
            width="auto"
            defaultValue={coordinates[1]}
            precision={9}
            step={0.005}
            onChange={(valueString) =>
              onSearchChange([coordinates[0], parseFloat(valueString)])
            }
          >
            <NumberInputField />
            <NumberInputStepper>
              <NumberIncrementStepper />
              <NumberDecrementStepper />
            </NumberInputStepper>
          </NumberInput>
        </HStack>
      )}
      <DynamicAddressAutofill
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
        options={options}
        onRetrieve={handleRetrieve}
      >
        <InputGroup
          maxW={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
          size={{ base: "md", md: "lg", xl: "lg" }}
          data-testid="search-bar"
        >
          <InputLeftElement>
            <IoSearchSharp
              color="grey.900"
              fontSize="1.1em"
              data-testid="search-icon"
            />
          </InputLeftElement>
          <Input
            placeholder="Search San Francisco address"
            fontSize={{ base: "md", sm: "md", md: "md", lg: "lg" }}
            p={{
              base: "0 10px 0 35px",
              sm: "0 10px 0 35px",
              md: "0 10px 0 48px",
              lg: "0 10px 0 48px",
            }}
            borderRadius="50"
            bgColor="white"
            focusBorderColor="yellow"
            type="text"
            name="address-1"
            value={address}
            onChange={handleAddressChange}
            _hover={{
              borderColor: "yellow",
              _placeholder: { color: "grey.900" },
            }}
            _invalid={{ borderColor: "red" }}
            autoComplete="address-line1"
          />
          <InputRightElement>
            <RxCross2
              color="grey.900"
              fontSize="1.1em"
              data-testid="clear-icon"
              onClick={handleClearClick}
            />
          </InputRightElement>
        </InputGroup>
      </DynamicAddressAutofill>
    </form>
  );
};

export default SearchBar;
