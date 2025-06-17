"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl, { LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import { toaster } from "@/components/ui/toaster";

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
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>(undefined);
  const markerRef = useRef<mapboxgl.Marker>(undefined);
  const toastIdInvalidToken = "invalid-token";
  const toastIdNoToken = "no-token";

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapContainerRef.current || !mapboxToken) {
      if (toaster.isDismissed(toastIdNoToken)) {
        // TODO: or use `!toaster.isVisible`? trying to replace `!toast.isActive` from Chakra v2
        toaster.create({
          id: toastIdNoToken,
          description: "Mapbox access token or container is not set!",
          type: "error",
          duration: 5000,
          closable: true,
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
        map.addSource("seismic", { type: "geojson", data: liquefactionData });

        map.addSource("tsunami", { type: "geojson", data: tsunamiData });

        map.addSource("soft-stories", { type: "geojson", data: softStoryData });

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
            if (toaster.isDismissed(toastIdNoToken)) {
              // TODO: or use `!toaster.isVisible`? trying to replace `!toast.isActive` from Chakra v2
              toaster.create({
                id: toastIdNoToken,
                description: "Invalid Mapbox access token!",
                type: "error",
                duration: 5000,
                closable: true,
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
  }, [coordinates, liquefactionData, softStoryData, tsunamiData]);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default Map;
