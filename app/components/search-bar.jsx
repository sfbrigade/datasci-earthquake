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

  const handleClearClick = () => {
    console.log(address);
    console.log(fullAddress);
    setAddress("");
  };

  const handleRetrieve = (event) => {
    const addressData = event.features[0];
    const addressLine = event.features[0].properties.feature_name;
    onAddressSearch(addressLine);
    setFullAddress(addressData);
  };

  useEffect(() => {
    if (fullAddress) {
      onCoordDataRetrieve(values);
    } else {
      onCoordDataRetrieve([]);
    }
  }, [fullAddress, onCoordDataRetrieve]);

  const handleAddressChange = async (event) => {
    setAddress(event.target.value);
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
  };

  const sendCoordinates = (event) => {
    console.log("send coordinates");
    event.preventDefault();
    console.log(coordinates);

    // Send coordinates to the backend
    const isSoftStory = fetch(
      `http://127.0.0.1:8000/api/soft-stories/is-soft-story?lon=${coordinates[0]}&lat=${coordinates[1]}`
    ) // Send the coordinates to the backend
      .then((response) => response.json());

    const isInTsunamiZone = fetch(
      `http://127.0.0.1:8000/api/tsunami-zones/is-in-tsunami-zone?lon=${coordinates[0]}&lat=${coordinates[1]}`
    ) // Send the coordinates to the backend
      .then((response) => response.json());

    const isInLiquefactionZone = fetch(
      `http://127.0.0.1:8000/api/liquefaction-zones/is-in-liquefaction-zone?lon=${coordinates[0]}&lat=${coordinates[1]}`
    ) // Send the coordinates to the backend
      .then((response) => response.json());

    Promise.all([isSoftStory, isInTsunamiZone, isInLiquefactionZone]).then(
      (values) => console.log("values", values)
    );
  };

  return (
    <form onSubmit={sendCoordinates}>
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
