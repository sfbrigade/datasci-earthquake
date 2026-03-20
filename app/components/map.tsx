"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl, { LngLat, LngLatLike, MapOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { toaster } from "@/components/ui/toaster";
import { LayerToggleObjProps } from "./address-mapper";

const defaultCoords: LngLatLike = [-122.408020683, 37.801698301]; // TODO: dedupe with address-mapper default coords; consider centralizing in a constants file if we need to use in more places
const mapOptions: Omit<MapOptions, "container"> = {
  style: "mapbox://styles/mapbox/standard",
  center: defaultCoords,
  zoom: 12.1, // Start with more zoomed-out view but not too far
  minZoom: 11, // Allow users to zoom out more
  maxZoom: 15, // Increase max zoom to allow closer inspection
  maxBounds: [
    [-122.6, 37.65], // Southwest coordinates
    [-122.25, 37.85], // Northeast coordinates
  ],
  dragRotate: false, // turn off rotation on drag
  touchPitch: false, // turn off pitch change w/touch
  touchZoomRotate: true, // turn on zoom/rotate w/touch
  config: {
    // Initial configuration for the Mapbox Standard style set above. By default, its ID is `basemap`.
    basemap: {
      // 'default', 'faded', or 'monochrome'
      theme: "monochrome",
    },
  },
};
interface MapProps {
  coordinates: number[];
  layerToggleObj: LayerToggleObjProps;
}

const Map: React.FC<MapProps> = ({
  coordinates = defaultCoords,
  layerToggleObj,
}: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>(undefined);
  const markerRef = useRef<mapboxgl.Marker>(undefined);
  const toastIdInvalidToken = "invalid-token";
  const toastIdNoToken = "no-token";

  const handleToggleLayers = () => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    const layerId = layerToggleObj.layerId;

    if (layerId && map.getLayer(layerId)) {
      const newVisibility = layerToggleObj.toggleState ? "visible" : "none";
      // sets new visibility property value for layer, creating the "toggling" effect
      map.setLayoutProperty(layerId, "visibility", newVisibility);
    }
  };

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapContainerRef.current || !mapboxToken) {
      if (!toaster.isVisible(toastIdNoToken)) {
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
        ...mapOptions,
      });

      const map = mapRef.current;

      map.touchZoomRotate.disableRotation(); // turn off rotate w/touch

      const nav = new mapboxgl.NavigationControl({ showCompass: false });
      map.addControl(nav, "bottom-right");

      // Mark the map as interactive on first render, which is when the canvas is
      // visible and pan/zoom interactions begin responding. Waiting for `load`
      // overstates the user-visible interactivity time because it includes later
      // style/tile work and any deferred GeoJSON registration.
      map.once("render", () => {
        if (typeof window !== "undefined") {
          (window as any).__mapInteractive = performance.now();
          window.performance?.mark("map-interactive");
        }
      });

      // wait for map to load before drawing marker and adding GeoJSON layers
      map.on("load", () => {
        // Draw address marker (lightweight — keep synchronous)
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

        // Fetch and add the hazard overlays after the base map is already visible.
        // This removes GeoJSON serialization from the initial HTML and keeps first
        // interaction independent from overlay processing.
        const addLayers = async () => {
          const [liquefactionData, tsunamiData, softStoryData] = await Promise.all(
            [
              fetch("/data/LiquefactionZone.geojson"),
              fetch("/data/TsunamiZone.geojson"),
              fetch("/data/SoftStoryProperty.geojson"),
            ].map(async (responsePromise) => {
              const response = await responsePromise;
              return response.json();
            })
          );

          // Add sources
          map.addSource("seismic", { type: "geojson", data: liquefactionData });
          map.addSource("tsunami", { type: "geojson", data: tsunamiData });
          map.addSource("soft-stories", {
            type: "geojson",
            data: softStoryData,
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
              if (!toaster.isVisible(toastIdInvalidToken)) {
                toaster.create({
                  id: toastIdInvalidToken,
                  description: "Invalid Mapbox access token!",
                  type: "error",
                  duration: 5000,
                  closable: true,
                });
              }
              console.error("Invalid Mapbox token:", e.error);
            }
          });
        };

        if (typeof window !== "undefined" && "requestIdleCallback" in window) {
          (window as any).requestIdleCallback(addLayers, { timeout: 2000 });
        } else {
          setTimeout(addLayers, 0);
        }
      });
    } else {
      // subsequent passes: update map
      const map = mapRef.current;
      const addressLngLat = new LngLat(coordinates[0], coordinates[1]);
      map.panTo(addressLngLat);
      markerRef.current?.setLngLat(addressLngLat);
      return;
    }
  }, [coordinates]);

  useEffect(() => {
    if (layerToggleObj.layerId != "") handleToggleLayers();
  }, [layerToggleObj]); // re-runs every time state changes

  return (
    <div
      ref={mapContainerRef}
      style={{ width: "100%", height: "100%", contain: "layout paint size" }}
    />
  );
};

export default Map;
