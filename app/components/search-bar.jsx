"use client";

import { useState, useEffect, useCallback, Suspense } from "react";
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

const options = {
  country: "US",
  limit: 10,
  bbox: [
    [-122.55, 37.69],
    [-122.35, 37.83],
  ],
  proximity: { lng: -122.4194, lat: 37.7749 },
  streets: false,
};

const safeJsonFetch = async (url) => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text(); // capture any error response
    throw new Error(
      `HTTP ${res.status} - ${res.statusText} | ${text} | URL: ${url}`
    );
  }
  return res.json();
};

const SearchBar = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
  onHazardDataLoading,
  onSearchComplete,
}) => {
  const [inputAddress, setInputAddress] = useState("");
  const debug = useSearchParams().get("debug");
  const router = useRouter();
  const searchParams = useSearchParams();
  const toast = useToast();
  const toastIdFailedHazardData = "failed-hazard-data";

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
          safeJsonFetch(buildUrl(API_ENDPOINTS.isSoftStory)),
          safeJsonFetch(buildUrl(API_ENDPOINTS.isInTsunamiZone)),
          safeJsonFetch(buildUrl(API_ENDPOINTS.isInLiquefactionZone)),
        ]);

      onHazardDataLoading(false);
      onSearchComplete(true);

      const failed = [
        { name: "Soft Story", result: softStory },
        { name: "Tsunami", result: tsunamiZone },
        { name: "Liquefaction", result: liquefactionZone },
      ].filter(({ result }) => result.status === "rejected");

      if (failed.length > 0) {
        if (!toast.isActive(toastIdFailedHazardData)) {
          toast({
            id: "failed-hazard-data",
            title: "Hazard data warning",
            description: `Failed to fetch: ${failed
              .map((f) => f.name)
              .join(", ")}`,
            status: "warning",
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
      }

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
      throw error;
    } finally {
      onHazardDataLoading(false);
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
      memoizedOnAddressSearch(address);
      memoizedOnSearchChange(coords);
      memoizedUpdateHazardData(coords);
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

      <InputGroup
        w={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
        size={{ base: "md", md: "lg", xl: "lg" }}
        mb={"24px"}
        data-testid="search-bar"
      >
        <InputLeftElement>
          <IoSearchSharp
            color="grey.900"
            fontSize="1.1em"
            data-testid="search-icon"
          />
        </InputLeftElement>
        <Suspense>
          <DynamicAddressAutofill
            accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN}
            options={options}
            onRetrieve={handleRetrieve}
          >
            <Input
              placeholder="Search San Francisco address"
              fontFamily="Inter, sans-serif"
              fontSize={{ base: "md", sm: "md", md: "md", lg: "md" }}
              p={{
                base: "0 10px 0 35px",
                sm: "0 10px 0 35px",
                md: "0 10px 0 48px",
                lg: "0 10px 0 48px",
              }}
              borderRadius="50"
              border="1px solid #4A5568"
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
          </DynamicAddressAutofill>
        </Suspense>
      </InputGroup>
    </form>
  );
};

export default SearchBar;
