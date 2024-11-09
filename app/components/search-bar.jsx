"use client";

import { useState } from "react";
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
} from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import { AddressAutofill } from "@mapbox/search-js-react";

const SearchBar = () => {
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] = useState(null);

  const handleClearClick = () => {
    console.log(address);
    console.log(fullAddress);
    setAddress("");
  };

  const handleRetrieve = (event) => {
    const addressData = event.features[0];
    setFullAddress(addressData);
  };

  return (
    <form>
      <AddressAutofill
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
            type="text"
            name="address-1"
            value={address}
            onChange={(event) => setAddress(event.target.value)}
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
      </AddressAutofill>
    </form>
  );
};

export default SearchBar;
