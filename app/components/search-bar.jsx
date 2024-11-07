"use client";

import { useState } from "react";
import { Input, InputGroup, InputLeftElement } from "@chakra-ui/react";
import { IoSearchSharp } from "react-icons/io5";
import { AddressAutofill } from '@mapbox/search-js-react';


const SearchBar = () => {
  // const [isClient, setIsClient] = useState(false); 


  // useEffect(() => {
  //   setIsClient(true); // This will run on the client side after the initial render
  // }, []);

  // if (!isClient) {
  //   return null; // Avoid rendering the AddressAutofill component on the server side
  // }

  return (
    <form>
      <AddressAutofill
        accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
      >
        <InputGroup
          maxW={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
          size={{ base: "md", md: "lg", xl: "lg" }}
          data-testid="search-bar"
        >
          <InputLeftElement>
            <IoSearchSharp
              color="#2C5282"
              fontSize="1.1em"
              data-testid="search-icon"
            />
          </InputLeftElement>
          <Input
            placeholder="Search San Francisco address"
            p="0 10px 0 48px"
            borderRadius="50"
            bgColor="white"
            focusBorderColor="yellow"
            type="text" 
            name="address-1"
            _hover={{ borderColor: "yellow", _placeholder: {color: "grey.900"} }}
            _invalid={{ borderColor: "red" }}
            autocomplete="address-line1"
          />
        </InputGroup>
      </AddressAutofill>
    </form>

  );
};

export default SearchBar;
