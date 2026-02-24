"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  // createContext,
  // useContext,
} from "react";

import { useSetAtom } from "jotai";
import {
  searchedAddressAtom,
  isSearchCompleteAtom,
} from "@/atoms/AddressSearchAtom";

import { Box } from "@chakra-ui/react";
// import { useRouter } from "next/navigation";
import { toaster } from "@/components/ui/toaster";
import Map from "./map";
import ReportHazards from "./report-hazards";
import MobileReportHazards from "./mobile-report-hazards";
import { FeatureCollection, Geometry } from "geojson";
import HomeHeader from "./home-header";
import { useSearchParams } from "next/navigation";
import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";
import { useAddressFromSearchParams } from "@/hooks/useAddressFromSearchParams";

const addressLookupCoordinates = {
  geometry: { type: "Point", coordinates: [-122.408020683, 37.801698301] },
};
const defaultCoords = addressLookupCoordinates.geometry.coordinates ?? [];
const toggledStatesDefaults = [true, true, true];

interface AddressMapperProps {
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
}

export type LayerToggleObjProps = {
  layerId: string;
  toggleState: boolean;
};

type ErrorResult = { error: true; message: string };

const isErrorResult = (data: unknown): data is ErrorResult => {
  return (
    typeof data === "object" &&
    data !== null &&
    "error" in data &&
    (data as any).error === true
  );
};

// export type AddressSearchContextType = {
//   searchedAddress: string | null;
//   setSearchedAddress: (value: string | null) => void;
//   isSearchComplete: boolean;
//   setIsSearchComplete: (value: boolean) => void;
// };

// export const AddressSearchContext = createContext<AddressSearchContextType>({
//   searchedAddress: null,
//   setSearchedAddress: () => {},
//   isSearchComplete: false,
//   setIsSearchComplete: () => {},
// });

const AddressMapper: React.FC<AddressMapperProps> = ({
  softStoryData,
  tsunamiData,
  liquefactionData,
}) => {
  const { coordinates, coordinateKey, address } = useAddressFromSearchParams();

  const setSearchedAddress = useSetAtom(searchedAddressAtom);
  const setIsSearchComplete = useSetAtom(isSearchCompleteAtom);

  // initialize state directly from searchParams or fall back to null
  // const [coordinates, setCoordinates] = useState<number[] | null>(
  //   initialLat && initialLon
  //     ? [parseFloat(initialLon), parseFloat(initialLat)]
  //     : null
  // );

  // const [searchedAddress, setSearchedAddress] = useState(
  //   initialAddress || null
  // );
  // const [isSearchComplete, setSearchComplete] = useState(false);
  const [addressHazardData, setAddressHazardData] = useState<object>({});
  const [isHazardDataLoading, setHazardDataLoading] = useState(false);
  const [toggledStates, setToggledStates] = useState<boolean[]>(
    toggledStatesDefaults
  );
  const [layerToggleObj, setLayerToggleObj] = useState<LayerToggleObjProps>({
    layerId: "",
    toggleState: true,
  });
  const [showHazards, setShowHazards] = useState(false);
  const [currentView, setCurrentView] = useState("");
  const toastIdDataLoadFailed = "data-load-failed";
  // const coordinatesRef = useRef<number[] | null>(null);
  // const router = useRouter();

  //   const {
  //   setSearchedAddress,
  //   setIsSearchComplete,
  // } = useContext(AddressSearchContext);

  const { fetchHazardData } = useHazardDataFetcher({
    setSearchComplete: setIsSearchComplete,
    setHazardDataLoading,
  });

  const updateHazardData = useCallback(
    async (coords: number[]) => {
      try {
        const values = await fetchHazardData(coords);
        setAddressHazardData(values);
      } catch (error) {
        console.error(
          "Error while retrieving data: ",
          error instanceof Error ? error.message : error?.toString()
        );
        setAddressHazardData({
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
    },
    [fetchHazardData]
  );

  const handleResize = () => {
    setCurrentView(window.innerWidth <= 480 ? "mobile" : "desktop");
  };

  useEffect(() => {
    if (address) {
      // only set if atom hasn't already been initialized
      setSearchedAddress((prev) => prev ?? address);
    }
  }, [address, setSearchedAddress]);

  useEffect(() => {
    if (!coordinates || !address) {
      setSearchedAddress(null);
      setIsSearchComplete(false);
      setAddressHazardData({});
      return;
    }

    setSearchedAddress(address);
    setIsSearchComplete(true);

    updateHazardData(coordinates);
  }, [coordinateKey, address, updateHazardData]);

  // useEffect(() => {
  //   const lat = searchParams.get("lat");
  //   const lon = searchParams.get("lon");
  //   const address = searchParams.get("address");

  //   console.log(lat, "LAT");
  //   console.log(lon, "LON");
  //   console.log(address, "ADDRESS");

  //   if (lat && lon && address) {
  //     const newCoords = [parseFloat(lon), parseFloat(lat)];
  //     const lastCoords = coordinatesRef.current;

  //     // only update state and fetch data if coordinates have changed
  //     if (
  //       !lastCoords ||
  //       lastCoords[0] !== newCoords[0] ||
  //       lastCoords[1] !== newCoords[1]
  //     ) {
  //       setCoordinates(newCoords);
  //       setSearchedAddress(address);
  //       setIsSearchComplete(true);
  //       coordinatesRef.current = newCoords;
  //       updateHazardData(newCoords);
  //     }
  //   } else if (coordinatesRef.current) {
  //     // clear state and coordinatesRef when navigating to a page without location params(ex. navigating back to main page after viewing a result)
  //     setCoordinates(null);
  //     setSearchedAddress(null);
  //     setIsSearchComplete(false);
  //     setAddressHazardData({});
  //     coordinatesRef.current = null;
  //   }
  // }, [searchParams, updateHazardData]);

  useEffect(() => {
    const sources = [
      { name: "Soft Story Buildings", data: softStoryData },
      { name: "Tsunami Zones", data: tsunamiData },
      { name: "Liquefaction Zones", data: liquefactionData },
    ];

    const errors = sources
      .filter((src) => isErrorResult(src.data))
      .map(
        (src) =>
          `${src.name}: ${(src.data as unknown as ErrorResult).message || "Unknown error"}`
      );

    if (errors.length > 0) {
      if (!toaster.isVisible(toastIdDataLoadFailed)) {
        toaster.create({
          id: toastIdDataLoadFailed,
          title: "Data Load Error",
          description: errors.join(" | "),
          type: "error",
          duration: 5000,
          closable: true,
        });
      }
    }
  }, [softStoryData, tsunamiData, liquefactionData]);

  useEffect(() => {
    if (currentView === "") {
      handleResize();
    }
    window.addEventListener("resize", handleResize);
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, [currentView]);

  return (
    <>
      {/* <HomeHeader
        searchedAddress={searchedAddress}
        isSearchComplete={isSearchComplete}
        onSearchChange={handleSearchChange}
      /> */}
      {/* FIXME: the calculation no longer seems to work; double check and fix if necessary */}
      <Box
        w="full"
        css={{
          "--header-height": "198px",
          md: { "--header-height": "175px" },
          xl: { "--header-height": "141px" },
          "2xl": { "--header-height": "149px" },
          "--whitespace-height": "32px",
        }}
        style={{
          height:
            "calc(100dvh - var(--header-height) - var(--whitespace-height)",
        }}
        m="auto"
        position="relative"
      >
        <Box h="full" overflow="hidden">
          <Box zIndex="docked" top="0" position="absolute">
            {currentView === "desktop" ? (
              <ReportHazards
                addressHazardData={addressHazardData}
                isHazardDataLoading={isHazardDataLoading}
                toggledStates={toggledStates}
                setToggledStates={setToggledStates}
                setLayerToggleObj={setLayerToggleObj}
              />
            ) : currentView === "mobile" ? (
              <MobileReportHazards
                showHazards={showHazards}
                addressHazardData={addressHazardData}
                isHazardDataLoading={isHazardDataLoading}
                toggledStates={toggledStates}
                setShowHazards={setShowHazards}
                setToggledStates={setToggledStates}
                setLayerToggleObj={setLayerToggleObj}
              />
            ) : null}
          </Box>
          <Map
            coordinates={coordinates || defaultCoords}
            softStoryData={softStoryData}
            tsunamiData={tsunamiData}
            liquefactionData={liquefactionData}
            layerToggleObj={layerToggleObj}
          />
        </Box>
      </Box>
    </>
  );
};

export default AddressMapper;
// "use client";

// import { useCallback, useEffect, useRef, useState } from "react";
// import { Box } from "@chakra-ui/react";
// import { useRouter } from "next/navigation";
// import { toaster } from "@/components/ui/toaster";
// import Map from "./map";
// import ReportHazards from "./report-hazards";
// import MobileReportHazards from "./mobile-report-hazards";
// import { FeatureCollection, Geometry } from "geojson";
// import HomeHeader from "./home-header";
// import { useSearchParams } from "next/navigation";
// import { useHazardDataFetcher } from "../hooks/useHazardDataFetcher";

// const addressLookupCoordinates = {
//   geometry: { type: "Point", coordinates: [-122.408020683, 37.801698301] },
// };
// const defaultCoords = addressLookupCoordinates.geometry.coordinates ?? [];
// const toggledStatesDefaults = [true, true, true];

// interface AddressMapperProps {
//   softStoryData: FeatureCollection<Geometry>;
//   tsunamiData: FeatureCollection<Geometry>;
//   liquefactionData: FeatureCollection<Geometry>;
// }

// export type LayerToggleObjProps = {
//   layerId: string;
//   toggleState: boolean;
// };

// type ErrorResult = { error: true; message: string };

// const isErrorResult = (data: unknown): data is ErrorResult => {
//   return (
//     typeof data === "object" &&
//     data !== null &&
//     "error" in data &&
//     (data as any).error === true
//   );
// };

// const AddressMapper: React.FC<AddressMapperProps> = ({
//   softStoryData,
//   tsunamiData,
//   liquefactionData,
// }) => {
//   const searchParams = useSearchParams();
//   const initialLat = searchParams.get("lat");
//   const initialLon = searchParams.get("lon");
//   const initialAddress = searchParams.get("address");

//   // initialize state directly from searchParams or fall back to null
//   const [coordinates, setCoordinates] = useState<number[] | null>(
//     initialLat && initialLon
//       ? [parseFloat(initialLon), parseFloat(initialLat)]
//       : null
//   );
//   const [searchedAddress, setSearchedAddress] = useState(
//     initialAddress || null
//   );
//   const [addressHazardData, setAddressHazardData] = useState<object>({});
//   const [isHazardDataLoading, setHazardDataLoading] = useState(false);
//   const [toggledStates, setToggledStates] = useState<boolean[]>(
//     toggledStatesDefaults
//   );
//   const [layerToggleObj, setLayerToggleObj] = useState<LayerToggleObjProps>({
//     layerId: "",
//     toggleState: true,
//   });
//   const [showHazards, setShowHazards] = useState(false);
//   const [isSearchComplete, setSearchComplete] = useState(false);
//   const [currentView, setCurrentView] = useState("");
//   const toastIdDataLoadFailed = "data-load-failed";
//   const coordinatesRef = useRef<number[] | null>(null);
//   const router = useRouter();

//   const { fetchHazardData } = useHazardDataFetcher({
//     setSearchComplete,
//     setHazardDataLoading,
//   });

//   const updateHazardData = useCallback(
//     async (coords: number[]) => {
//       try {
//         const values = await fetchHazardData(coords);
//         setAddressHazardData(values);
//       } catch (error) {
//         console.error(
//           "Error while retrieving data: ",
//           error instanceof Error ? error.message : error?.toString()
//         );
//         setAddressHazardData({
//           softStory: null,
//           tsunami: null,
//           liquefaction: null,
//         });
//         toaster.create({
//           description: "Could not retrieve hazard data",
//           type: "error",
//           duration: 5000,
//           closable: true,
//         });
//       }
//     },
//     [fetchHazardData]
//   );

//   const handleResize = () => {
//     setCurrentView(window.innerWidth <= 480 ? "mobile" : "desktop");
//   };

//   const handleSearchChange = useCallback(
//     (coords: number[], address: string) => {
//       const newUrl = `?address=${encodeURIComponent(address)}&lat=${coords[1]}&lon=${coords[0]}`;
//       router.push(newUrl, { scroll: false });
//     },
//     [router]
//   );

//   useEffect(() => {
//     const lat = searchParams.get("lat");
//     const lon = searchParams.get("lon");
//     const address = searchParams.get("address");

//     if (lat && lon && address) {
//       const newCoords = [parseFloat(lon), parseFloat(lat)];
//       const lastCoords = coordinatesRef.current;

//       // only update state and fetch data if coordinates have changed
//       if (
//         !lastCoords ||
//         lastCoords[0] !== newCoords[0] ||
//         lastCoords[1] !== newCoords[1]
//       ) {
//         setCoordinates(newCoords);
//         setSearchedAddress(address);
//         coordinatesRef.current = newCoords;
//         updateHazardData(newCoords);
//       }
//     } else if (coordinatesRef.current) {
//       // clear state and coordinatesRef when navigating to a page without location params(ex. navigating back to main page after viewing a result)
//       setCoordinates(null);
//       setSearchedAddress(null);
//       setAddressHazardData({});
//       setSearchComplete(false);
//       coordinatesRef.current = null;
//     }
//   }, [searchParams, updateHazardData]);

//   useEffect(() => {
//     const sources = [
//       { name: "Soft Story Buildings", data: softStoryData },
//       { name: "Tsunami Zones", data: tsunamiData },
//       { name: "Liquefaction Zones", data: liquefactionData },
//     ];

//     const errors = sources
//       .filter((src) => isErrorResult(src.data))
//       .map(
//         (src) =>
//           `${src.name}: ${(src.data as unknown as ErrorResult).message || "Unknown error"}`
//       );

//     if (errors.length > 0) {
//       if (!toaster.isVisible(toastIdDataLoadFailed)) {
//         toaster.create({
//           id: toastIdDataLoadFailed,
//           title: "Data Load Error",
//           description: errors.join(" | "),
//           type: "error",
//           duration: 5000,
//           closable: true,
//         });
//       }
//     }
//   }, [softStoryData, tsunamiData, liquefactionData]);

//   useEffect(() => {
//     if (currentView === "") {
//       handleResize();
//     }
//     window.addEventListener("resize", handleResize);
//     return () => {
//       window.removeEventListener("resize", handleResize);
//     };
//   }, [currentView]);

//   return (
//     <>
//       <HomeHeader
//         searchedAddress={searchedAddress}
//         isSearchComplete={isSearchComplete}
//         onSearchChange={handleSearchChange}
//       />
//       {/* FIXME: the calculation no longer seems to work; double check and fix if necessary */}
//       <Box
//         w="full"
//         css={{
//           "--header-height": "198px",
//           md: { "--header-height": "175px" },
//           xl: { "--header-height": "141px" },
//           "2xl": { "--header-height": "149px" },
//           "--whitespace-height": "32px",
//         }}
//         style={{
//           height:
//             "calc(100dvh - var(--header-height) - var(--whitespace-height)",
//         }}
//         m="auto"
//         position="relative"
//       >
//         <Box h="full" overflow="hidden">
//           <Box zIndex="docked" top="0" position="absolute">
//             {currentView === "desktop" ? (
//               <ReportHazards
//                 addressHazardData={addressHazardData}
//                 isHazardDataLoading={isHazardDataLoading}
//                 toggledStates={toggledStates}
//                 setToggledStates={setToggledStates}
//                 setLayerToggleObj={setLayerToggleObj}
//               />
//             ) : currentView === "mobile" ? (
//               <MobileReportHazards
//                 showHazards={showHazards}
//                 addressHazardData={addressHazardData}
//                 isHazardDataLoading={isHazardDataLoading}
//                 toggledStates={toggledStates}
//                 setShowHazards={setShowHazards}
//                 setToggledStates={setToggledStates}
//                 setLayerToggleObj={setLayerToggleObj}
//               />
//             ) : null}
//           </Box>
//           <Map
//             coordinates={coordinates || defaultCoords}
//             softStoryData={softStoryData}
//             tsunamiData={tsunamiData}
//             liquefactionData={liquefactionData}
//             layerToggleObj={layerToggleObj}
//           />
//         </Box>
//       </Box>
//     </>
//   );
// };

// export default AddressMapper;
