"use client";

import React, { useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import mapboxgl, { LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import { useToast } from "@chakra-ui/react";

const defaultCoords = [-122.463733, 37.777448];

interface MapProps {
  coordinates: number[];
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
}

const Map: React.FC<MapProps> = ({
  coordinates = defaultCoords,
  softStoryData,
  tsunamiData,
  liquefactionData,
}: MapProps) => {
  const debug = useSearchParams().get("debug");
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>();
  const markerRef = useRef<mapboxgl.Marker>();
  const toast = useToast();
  const toastIdInvalidToken = "invalid-token";
  const toastIdNoToken = "no-token";

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapContainerRef.current || !mapboxToken) {
      if (!toast.isActive(toastIdNoToken)) {
        toast({
          id: toastIdNoToken,
          description: "Mapbox access token or container is not set!",
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
      console.error("Mapbox access token or container is not set!");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    if (!mapRef.current) {
      // initial pass: render map
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        style: "mapbox://styles/mapbox/standard",
        center: [-122.437, 37.75],
        zoom: 11, // Start with more zoomed-out view but not too far
        minZoom: 10.5, // Allow users to zoom out more
        maxZoom: 15, // Increase max zoom to allow closer inspection
        maxBounds: [
          [-122.6, 37.65], // Southwest coordinates
          [-122.25, 37.85], // Northeast coordinates
        ],
        dragRotate: false, // turn off rotation on drag
        touchPitch: false, // turn off pitch change w/touch
        touchZoomRotate: true, // turn on zoom/rotate w/touch
        keyboard: true, // turn on keyboard shortcuts
        cooperativeGestures: true, // scroll-to-zoom requires using the control or command key while scrolling to zoom the map
        config: {
          // Initial configuration for the Mapbox Standard style set above. By default, its ID is `basemap`.
          basemap: {
            // 'default', 'faded', or 'monochrome'
            theme: "monochrome",
          },
        },
      });

      const map = mapRef.current;

      map.touchZoomRotate.disableRotation(); // turn off rotate w/touch

      const nav = new mapboxgl.NavigationControl({ showCompass: false });
      map.addControl(nav, "right");

      // wait for map to load before drawing marker
      map.on("load", () => {
        // Draw address marker
        const el = document.createElement("div");

        const addressLngLat = new LngLat(coordinates[0], coordinates[1]);
        const addressMarker = new mapboxgl.Marker({
          anchor: "bottom",
          element: el,
          className: "marker",
        })
          .setLngLat(addressLngLat)
          .addTo(map);

        markerRef.current = addressMarker;

        // Add sources
        map.addSource("seismic", {
          type: "geojson",
          data: liquefactionData,
        });

        map.addSource("tsunami", {
          type: "geojson",
          data: tsunamiData,
        });

        map.addSource("soft-stories", {
          type: "geojson",
          data: softStoryData,
        });

        // Add layers
        map.addLayer({
          id: "seismicLayer",
          source: "seismic",
          type: "fill",
          slot: "middle",
          paint: {
            "fill-color": "#F6AD55", // orange/300
            "fill-opacity": 0.5, // 50% opacity
          },
        });

        map.addLayer({
          id: "tsunamiLayer",
          source: "tsunami",
          type: "fill",
          slot: "middle",
          paint: {
            "fill-color": "#63B3ED", // blue/300
            "fill-opacity": 0.25, // 50% opacity
          },
        });

        map.addLayer({
          id: "softStoriesLayer",
          source: "soft-stories",
          type: "circle",
          slot: "middle",
          paint: {
            "circle-radius": 4.5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF",
            "circle-color": "#A0AEC0", // gray/400
          },
        });

        map.on("error", (e) => {
          if (e.error && e.error.message.includes("access token")) {
            if (!toast.isActive(toastIdInvalidToken)) {
              toast({
                id: toastIdInvalidToken,
                description: "Invalid Mapbox access token!",
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
            console.error("Invalid Mapbox token:", e.error);
          }
        });
      });
    } else {
      // subsequent passes: update map
      const map = mapRef.current;
      const addressLngLat = new LngLat(coordinates[0], coordinates[1]);
      map.panTo(addressLngLat);
      markerRef.current?.setLngLat(addressLngLat);
      return;
    }
  }, [coordinates, liquefactionData, softStoryData, tsunamiData, toast]);

  return (
    <>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
      {debug === "true" && (
        <span
          style={{
            backgroundColor: "pink",
            position: "absolute",
            top: 0,
            right: 0,
            zIndex: 99,
            fontSize: 24,
            padding: "4px",
          }}
        >
          {`${coordinates[0]}, ${coordinates[1]}`}
        </span>
      )}
    </>
  );
};

export default Map;
