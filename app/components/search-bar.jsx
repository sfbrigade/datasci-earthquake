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

const SearchBar = () => {
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] = useState(null);
  const addressInputRef = useRef(null);

  const handleAddressChange = (event) => {
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

  const handleRetrieve = (res) => {
    const addressData = res.features[0];
    setFullAddress(addressData);
  };

  return (
    <form>
      <DynamicAddressAutofill
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""}
      >
        {/* @ts-ignore */}
        <InputGroup
          maxW={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
          size={{ base: "md", md: "lg", xl: "lg" }}
          data-testid="search-bar"
        >
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
          />
          <InputLeftElement key="left-element">
            <IoSearchSharp
              color="grey.900"
              fontSize="1.1em"
              data-testid="search-icon"
            />
          </InputLeftElement>
          <InputRightElement key="right-element">
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
