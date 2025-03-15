"use client";

import { useState, useEffect } from "react";
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
import { API_ENDPOINTS } from "../api/endpoints";

// TODO: share bbox options with what's in `map.tsx`
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

const SearchBar = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
}) => {
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] = useState(null);
  const [addressLine, setAddressLine] = useState("");
  const debug = useSearchParams().get("debug");

  // fires when X button in search box is clicked
  const handleClearClick = () => {
    setAddress("");
  };

  // extract feature data (address, coordinates) from response and:
  // - update full address
  // - retrieve additional data about coordinates from our API
  // - retrieve associated coordinates from our API
  //
  // fired when the user has selected suggestion, before the form is autofilled (from https://docs.mapbox.com/mapbox-search-js/api/react/autofill/)
  const handleRetrieve = (event) => {
    const addressData = event.features[0];
    const addressLine = event.features[0].properties.feature_name;
    onAddressSearch(addressLine);
    setFullAddress(addressData);
    const coords = addressData.geometry.coordinates;
    onSearchChange(coords);
    getHazardData(coords).then((values) => {
      console.log("values", values);
      onCoordDataRetrieve(values);
    });
    // TODO: grab resolved address as well to update rest of UI
    // TODO: combine setFullAddress and onAddressSearch as they appear to both do the same thing?
  };

  // retrieve coordinates from Mapbox API by providing full address; called every time the user types or modifies the input value in the search box and loses focus?
  const handleAddressChange = (event) => {
    setAddress(event.target.value);
  };

  /**
   * TODO: capture and update address on submit OR use first autocomplete suggestion; see file://./../snippets.md#geocode-on-search for details.
   */
  const onSubmit = async (event) => {
    console.log("onSubmit", event.target.value);
    event.preventDefault();

    // TODO: capture and update address as described above
  };

  // gets metadata from Mapbox API for given coordinates
  const getHazardData = (coords = coordinates) => {
    // TODO: convert from promises to async/await
    // Send coordinates to the backend
    const isSoftStory = fetch(
      `${API_ENDPOINTS.isSoftStory}?lon=${coords[0]}&lat=${coords[1]}`
    ).then((response) => response.json());

    const isInTsunamiZone = fetch(
      `${API_ENDPOINTS.isInTsunamiZone}?lon=${coords[0]}&lat=${coords[1]}`
    ).then((response) => response.json());

    const isInLiquefactionZone = fetch(
      `${API_ENDPOINTS.isInLiquefactionZone}?lon=${coords[0]}&lat=${coords[1]}`
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
            boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
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
          {address.length != 0 && (
            <InputRightElement>
              <RxCross2
                color="grey.900"
                fontSize="1.1em"
                data-testid="clear-icon"
                onClick={handleClearClick}
              />
            </InputRightElement>
          )}
        </InputGroup>
      </DynamicAddressAutofill>
    </form>
  );
};

export default SearchBar;
