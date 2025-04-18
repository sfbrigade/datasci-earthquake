"use client";

import { useState, useEffect, useCallback } from "react";
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
  useToast,
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
  onHazardDataLoading,
}) => {
  const [inputAddress, setInputAddress] = useState("");
  const debug = useSearchParams().get("debug");
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();

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
    } catch (error) {
      console.error("Error while retrieving data: ", error?.message || error);
      onCoordDataRetrieve({
        softStory: null,
        tsunami: null,
        liquefaction: null,
      });
      toast({
        description: "Could not retrieve hazard data",
        status: "error",
        duration: 5000,
        isClosable: true,
        position: "top",
        containerStyle: {
          backgroundColor: "#b53d37",
          opacity: 1,
          borderRadius: "12px",
        },
      });
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
    onHazardDataLoading(true);
    const buildUrl = (endpoint) =>
      `${endpoint}?lon=${coords[0]}&lat=${coords[1]}`;

    try {
      const [softStory, tsunamiZone, liquefactionZone] =
        await Promise.allSettled([
          fetch(buildUrl(API_ENDPOINTS.isSoftStory)).then((res) => res.json()),
          fetch(buildUrl(API_ENDPOINTS.isInTsunamiZone)).then((res) =>
            res.json()
          ),
          fetch(buildUrl(API_ENDPOINTS.isInLiquefactionZone)).then((res) =>
            res.json()
          ),
        ]);

      onHazardDataLoading(false);

      return {
        softStory: softStory.status === "fulfilled" ? softStory.value : null,
        tsunami: tsunamiZone.status === "fulfilled" ? tsunamiZone.value : null,
        liquefaction:
          liquefactionZone.status === "fulfilled"
            ? liquefactionZone.value
            : null,
      };
    } catch (error) {
      console.error("Error fetching hazard data:", error);
      onHazardDataLoading(false);
      throw error;
    }
  };

  // temporary memoization fix for updating the address in the search bar.
  // TODO: refactor how we are caching our calls
  const memoizedOnSearchChange = useCallback(onSearchChange, []);
  const memoizedOnAddressSearch = useCallback(onAddressSearch, []);
  const memoizedUpdateHazardData = useCallback(updateHazardData, []);

  useEffect(() => {
    const address = searchParams.get("address");
    const lat = searchParams.get("lat");
    const lon = searchParams.get("lon");

    if (address && lat && lon) {
      const coords = [parseFloat(lon), parseFloat(lat)];
      onAddressSearch(address);
      onSearchChange(coords);
      updateHazardData(coords);
    }
  }, [
    searchParams,
    memoizedOnAddressSearch,
    memoizedOnSearchChange,
    memoizedUpdateHazardData,
  ]);

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
