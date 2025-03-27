"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
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
  const [inputAddress, setInputAddress] = useState("");
  const debug = useSearchParams().get("debug");
  const router = useRouter();
  const searchParams = useSearchParams();

  const handleClearClick = () => {
    setInputAddress("");
    router.push("/", { scroll: false });
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
    const coords = addressData.geometry.coordinates;

    onAddressSearch(addressLine);
    onSearchChange(coords);
    updateHazardData(coords);

    const newUrl = `?address=${encodeURIComponent(addressLine)}&lat=${coords[1]}&lon=${coords[0]}`;
    router.push(newUrl, { scroll: false });
  };

  const updateHazardData = async (coords) => {
    try {
      const values = await getHazardData(coords);
      onCoordDataRetrieve(values);
    } catch {
      console.log("could not retrieve hazard data");
      onCoordDataRetrieve([]);
    }
  };

  const handleAddressChange = (event) => {
    setInputAddress(event.target.value);
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
  const getHazardData = async (coords = coordinates) => {
    try {
      const isSoftStory = await fetch(
        `${API_ENDPOINTS.isSoftStory}?lon=${coords[0]}&lat=${coords[1]}`
      ).then((response) => response.json());

      const isInTsunamiZone = await fetch(
        `${API_ENDPOINTS.isInTsunamiZone}?lon=${coords[0]}&lat=${coords[1]}`
      ).then((response) => response.json());

      const isInLiquefactionZone = await fetch(
        `${API_ENDPOINTS.isInLiquefactionZone}?lon=${coords[0]}&lat=${coords[1]}`
      ).then((response) => response.json());

      return Promise.all([isSoftStory, isInTsunamiZone, isInLiquefactionZone]);
    } catch (error) {
      console.error("Error fetching hazard data:", error);
      // TODO: Handle error appropriately, e.g., return a default value or re-throw (for now, we are re-throwing)
      throw error;
    }
  };

  useEffect(() => {
    const address = searchParams.get("address");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (address && lat && lon) {
      const coords = [parseFloat(lon), parseFloat(lat)];
      setInputAddress(address);
      onAddressSearch(address);
      onSearchChange(coords);
      updateHazardData(coords);
    }
  }, []);

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
            value={inputAddress}
            onChange={handleAddressChange}
            _hover={{
              borderColor: "yellow",
              _placeholder: { color: "grey.900" },
            }}
            _invalid={{ borderColor: "red" }}
            autoComplete="address-line1"
          />
          {inputAddress.length != 0 && (
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
