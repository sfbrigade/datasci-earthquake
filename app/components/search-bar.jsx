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
import DynamicAddressAutofill from "./address-autofill";
import { data } from "autoprefixer";

const SearchBar = () => {
  const [address, setAddress] = useState("");
  const [fullAddress, setFullAddress] = useState(null);
  const [coordinates, setCoordinates] = useState([0, 0]);

  const handleClearClick = () => {
    console.log(address);
    console.log(fullAddress);
    setAddress("");
  };

  const handleRetrieve = (event) => {
    const addressData = event.features[0];
    setFullAddress(addressData);
  };

  const handleAddressChange = async (event) => {
    setAddress(event.target.value);
    setFullAddress(event.target.value);
    
    try{
      const url = `https://api.mapbox.com/geocoding/v5/mapbox.places/${fullAddress}.json?access_token=${process.env.NEXT_PUBLIC_MAPBOX_TOKEN}`;
      const response = await fetch(url);
      const response_data =await  response.json()
      
      
      if (response_data.features.length > 0){
        setCoordinates(response_data.features[0].center)
        
      }
    }
    catch(err){
      console.log(err);
    }
  }

  const sendCoordinates = (event) => {
    event.preventDefault();
    console.log(coordinates);

    // Send coordinates to the backend
    let res = fetch(
  `http://127.0.0.1:8000/soft-stories/is-soft-story?lon=${coordinates[0]}&lat=${coordinates[1]}`) // Send the coordinates to the backend
    .then((response) => response.json())
    .then((data) => console.log(data))  // Handle the response  here    



    console.log(res);

    };

  return (
    <form onSubmit={sendCoordinates}>
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
            type="text"
            name="address-1"
            value={address}
            onChange={
              handleAddressChange
            }
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
