"use client";

import React, { useState, useEffect, useRef } from "react";
import DynamicAddressAutofill from "./address-autofill";
// import { AddressAutofill } from "@mapbox/search-js-react";

import {
  AddressAutofillRetrieveResponse,
  AddressAutofillFeatureSuggestion,
} from "@mapbox/search-js-core";

const addressLookupCoordinates = {
  geometry: {
    type: "Point",
    coordinates: [-122.418020683, 37.801698301],
  },
};
const coords = addressLookupCoordinates.geometry.coordinates ?? [];

import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";

const SearchBar: React.FC = () => {
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] =
    useState<AddressAutofillFeatureSuggestion | null>(null);
  const [coordinates, setCoordinates] = useState([0, 0]);
  const [inputValue, setInputValue] = useState(coords[0]);
  const [input2Value, setInput2Value] = useState(coords[1]);
  const addressInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    console.log(inputValue, input2Value);
  }, [inputValue, input2Value]);

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(parseFloat(event.target.value));
  };

  const handleInput2Change = (event: React.ChangeEvent<HTMLInputElement>) => {
    setInput2Value(parseFloat(event.target.value));
  };

  const handleAddressChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    setAddress(newValue);
    if (addressInputRef.current) {
      addressInputRef.current.value = newValue;
      const inputEvent = new Event("input", { bubbles: true });
      addressInputRef.current.dispatchEvent(inputEvent);
    }
  };

  const handleClearClick = () => {
    console.log(address);
    console.log(fullAddress);
    setAddress("");
    if (addressInputRef.current) {
      addressInputRef.current.value = "";
      const event = new Event("input", { bubbles: true });
      addressInputRef.current.dispatchEvent(event);
    }
  };

  const handleRetrieve = (res: AddressAutofillRetrieveResponse) => {
    const addressData = res.features[0];
    setFullAddress(addressData);
  };

  return (
    <form>
      <input
        name="lat"
        type="text"
        value={inputValue}
        onChange={handleInputChange}
      />
      <input
        name="long"
        type="text"
        value={input2Value}
        onChange={handleInput2Change}
      />
      <DynamicAddressAutofill
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""}
      >
        {/* @ts-ignore */}
        <InputGroup
          maxW={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
          size={{ base: "md", md: "lg", xl: "lg" }}
          data-testid="search-bar"
        >
          {
            [
              <Input
                key="input"
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
              />,
              <InputLeftElement key="left-element">
                <IoSearchSharp
                  color="grey.900"
                  fontSize="1.1em"
                  data-testid="search-icon"
                />
              </InputLeftElement>,
              <InputRightElement key="right-element">
                <RxCross2
                  color="grey.900"
                  fontSize="1.1em"
                  data-testid="clear-icon"
                  onClick={handleClearClick}
                />
              </InputRightElement>,
            ] as React.ReactElement[]
          }
        </InputGroup>
      </DynamicAddressAutofill>
    </form>
  );
};

export default SearchBar;
