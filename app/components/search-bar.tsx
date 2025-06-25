"use client";

import {
  ChangeEvent,
  FormEvent,
  Suspense,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Input, InputGroup } from "@chakra-ui/react";
import { toaster } from "@/app/components/ui/toaster";
import { IoSearchSharp } from "react-icons/io5";
import { RxCross2 } from "react-icons/rx";
import DynamicAddressAutofill, {
  AddressAutofillOptions,
  AddressAutofillRetrieveResponse,
} from "./address-autofill";
import { API_ENDPOINTS } from "../api/endpoints";

const autofillOptions: AddressAutofillOptions = {
  country: "US",
  limit: 10,
  bbox: [-122.55, 37.69, -122.35, 37.83],
  proximity: { lng: -122.4194, lat: 37.7749 },
  streets: false,
  language: "en",
};

const safeJsonFetch = async (url: string) => {
  const res = await fetch(url);
  if (!res.ok) {
    const text = await res.text(); // capture any error response
    throw new Error(
      `HTTP ${res.status} - ${res.statusText} | ${text} | URL: ${url}`
    );
  }
  return res.json();
};

// NOTE: UI changes to this page ought to be reflected in its suspense skeleton `search-bar-skeleton.tsx` and vice versa
// TODO: isolate the usage of `useSearchParams()` so that the Suspense boundary can be even more narrow if possible
interface SearchBarProps {
  coordinates: number[];
  onSearchChange: (coords: number[]) => void;
  onAddressSearch: (address: string) => void;
  onCoordDataRetrieve: (data: {
    softStory: any[] | null;
    tsunami: any[] | null;
    liquefaction: any[] | null;
  }) => void;
  onHazardDataLoading: (hazardDataLoading: boolean) => void;
  onSearchComplete: (searchComplete: boolean) => void;
}

const SearchBar = ({
  coordinates,
  onSearchChange,
  onAddressSearch,
  onCoordDataRetrieve,
  onHazardDataLoading,
  onSearchComplete,
}: SearchBarProps) => {
  const [inputAddress, setInputAddress] = useState("");
  const router = useRouter();
  const searchParams = useSearchParams();
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
  const handleRetrieve = (res: AddressAutofillRetrieveResponse) => {
    const addressData = res.features[0];
    const addressLine = res.features[0].properties.feature_name;
    const coords = addressData.geometry.coordinates;

    onAddressSearch(addressLine);
    onSearchChange(coords);
    updateHazardData(coords);

    const newUrl = `?address=${encodeURIComponent(addressLine)}&lat=${coords[1]}&lon=${coords[0]}`;
    router.push(newUrl, { scroll: false });
  };

  const updateHazardData = async (coords: number[]) => {
    try {
      const values = await getHazardData(coords);
      onCoordDataRetrieve(values);
    } catch (error) {
      console.error(
        "Error while retrieving data: ",
        error instanceof Error ? error.message : error?.toString()
      );
      onCoordDataRetrieve({
        softStory: null,
        tsunami: null,
        liquefaction: null,
      });
      toaster.create({
        description: "Could not retrieve hazard data",
        type: "error",
        duration: 5000,
        closable: true,
      });
    }
  };

  const handleAddressChange = (event: ChangeEvent<HTMLInputElement>) => {
    setInputAddress(event.currentTarget.value);
  };

  /**
   * TODO: capture and update address on submit OR use first autocomplete suggestion; see file://./../snippets.md#geocode-on-search for details.
   */
  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    console.log("onSubmit", event.currentTarget.value);
    event.preventDefault();

    // TODO: capture and update address as described above
  };

  // gets metadata from Mapbox API for given coordinates
  const getHazardData = async (coords = coordinates) => {
    onHazardDataLoading(true);
    const buildUrl = (endpoint: string) =>
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
        if (toaster.isDismissed(toastIdFailedHazardData)) {
          // TODO: or use `!toaster.isVisible`? trying to replace `!toast.isActive` from Chakra v2
          toaster.create({
            id: "failed-hazard-data",
            title: "Hazard data warning",
            description: `Failed to fetch: ${failed
              .map((f) => f.name)
              .join(", ")}`,
            type: "warning",
            duration: 5000,
            closable: true,
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
      {/* TODO: do we still need to move Suspense and DynamicAddressAutofill inside of InputGroup to satisfy's DynamicAddressAutofill's requirement for a child type that is an <input>? or does the newer version of AddressAutofill allow for other child types? */}
      <Suspense>
        <DynamicAddressAutofill
          accessToken={process.env.NEXT_PUBLIC_MAPBOX_TOKEN ?? ""}
          options={autofillOptions}
          onRetrieve={handleRetrieve}
        >
          <InputGroup
            w={{ base: "303px", sm: "303px", md: "371px", lg: "417px" }}
            // TODO FIXME: does boxSize replace size for InputGroup in Chakra v3?
            boxSize={{ base: "md", md: "lg", xl: "lg" }}
            // size={{ base: "md", md: "lg", xl: "lg" }}
            mb={"24px"}
            data-testid="search-bar"
            startElement={
              //TODO FIXME: make sure this works to replace `InputLeftElement` visually/behaviorally
              <IoSearchSharp
                color="grey.900"
                fontSize="1.1em"
                data-testid="search-icon"
              />
            }
            endElement={
              //TODO FIXME: make sure this works to replace `InputRightElement` visually/behaviorally
              inputAddress.length !== 0 && (
                <RxCross2
                  color="grey.900"
                  fontSize="1.1em"
                  data-testid="clear-icon"
                  onClick={handleClearClick}
                />
              )
            }
          >
            <Input
              placeholder="Search San Francisco address"
              fontFamily="Inter, sans-serif"
              fontSize={{ base: "md", sm: "md", md: "md", lg: "md" }}
              size={{ base: "md", md: "lg", xl: "lg" }}
              p={{
                base: "0 10px 0 35px",
                sm: "0 10px 0 35px",
                md: "0 10px 0 48px",
                lg: "0 10px 0 48px",
              }}
              borderRadius="50"
              border="1px solid #4A5568"
              bgColor="white"
              boxShadow="0px 4px 6px -1px rgba(0, 0, 0, 0.1), 0px 2px 4px -1px rgba(0, 0, 0, 0.06)"
              type="text"
              name="address-1"
              value={inputAddress}
              onChange={handleAddressChange}
              _focus={{ borderColor: "yellow" }} // TODO FIXME: make sure this works to replace `focusBorderColor` and doesn't need _placeholder
              _hover={{
                borderColor: "yellow",
                _placeholder: { color: "grey.900" },
              }}
              _invalid={{ borderColor: "red" }}
              autoComplete="address-line1"
            />
          </InputGroup>
        </DynamicAddressAutofill>
      </Suspense>
    </form>
  );
};

export default SearchBar;
