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
import { mockAddressHazardData as values } from "../data/data";
import { data } from "autoprefixer";
import { API_ENDPOINTS } from "../api/endpoints";

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
    console.log("!!! clear click");
    console.log(address);
    console.log(fullAddress);
    setAddress("");
  };

  /*
    user types into search box
    mapbox API is called with search term to retrieve suggestions (which contain coordinates)
    suggestions show
    a) user selects suggestion
        new address and coordinates are extracted from selected suggestion
        UI is updated to reflect new address
        our API is called with coordinates to retrieve metadata
        cards are updated with metadata
    b) user presses enter (effectively ignoring suggestions) ... do we even handle this?
        - should we prevent enter?
        - google maps will sometimes select the first optionk
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
    console.log("!!! retrieve");
    console.log(event);
    console.dir(event.features);
    console.log(event.features[0]);
    const addressData = event.features[0];
    const addressLine = event.features[0].properties.feature_name;
    onAddressSearch(addressLine);
    const coords = addressData.geometry.coordinates;
    onSearchChange(coords);
    setFullAddress(addressData);
    console.log("coords", coords);
    getCoordData(coords);
  };

  useEffect(() => {
    if (fullAddress) {
      onCoordDataRetrieve(values);
    } else {
      onCoordDataRetrieve([]);
    }
  }, [fullAddress, onCoordDataRetrieve]);

  // will be called every time the user types or modifies the input value in the search box (and loses focus?)
  //
  // retrieve coordinates from Mapbox API by providing full address
  const handleAddressChange = async (event) => {
    console.log("!!! address change");
    setAddress(event.target.value);

    /*
    setFullAddress(event.target.value);

    try {
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
      const response = await fetch(url);
      const response_data = await response.json();

      if (
        response_data &&
        response_data.features &&
        response_data.features.length > 0
      ) {
        onSearchChange(response_data.features[0].center);
      }
    } catch (err) {
      console.log(err);
    }
    */
  };

  // (gets fired when user presses enter (or if there was a submit button, when the user clicks it))
  //
  // update coordinates
  const onSubmit = (event) => {
    // console.log("!!! onSubmit");
    // event.preventDefault();
    // onSearchChange(); // TODO: how to grab coordinates to pass to this function?
  };

  // gets metadata from Mapbox API for given coordinates
  const getCoordData = (coords = coordinates) => {
    console.log("!!! get coordinate data");
    console.log(coords);

    // Send coordinates to the backend
    const isSoftStory = fetch(
      `${API_ENDPOINTS.isSoftStory}?lon=${coords[0]}&lat=${coords[1]}`
    ) // Send the coordinates to the backend
      .then((response) => response.json());

    const isInTsunamiZone = fetch(
      `${API_ENDPOINTS.isInTsunamiZone}?lon=${coords[0]}&lat=${coords[1]}`
    ) // Send the coordinates to the backend
      .then((response) => response.json());

    const isInLiquefactionZone = fetch(
      `${API_ENDPOINTS.isInLiquefactionZone}?lon=${coords[0]}&lat=${coords[1]}`
    ) // Send the coordinates to the backend
      .then((response) => response.json());

    Promise.all([isSoftStory, isInTsunamiZone, isInLiquefactionZone]).then(
      (values) => console.log("values", values)
    );

    // return values?
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
