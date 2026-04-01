"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl, { LngLat, MapOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import { toaster } from "@/components/ui/toaster";
import { LayerToggleObjProps } from "./address-mapper";

const mapOptions: Omit<MapOptions, "container"> = {
  style: "mapbox://styles/mapbox/standard",
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
  initialCenter?: number[];
  address: string | null;
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
  layerToggleObj: LayerToggleObjProps;
}

const addMarker = (center: LngLat, map: mapboxgl.Map) => {
  const el = document.createElement("div");

  return new mapboxgl.Marker({
    anchor: "bottom",
    element: el,
    className: "marker",
  })
    .setLngLat(center)
    .addTo(map);
};

const Map: React.FC<MapProps> = ({
  initialCenter,
  address,
  softStoryData,
  tsunamiData,
  liquefactionData,
  layerToggleObj,
}: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>(null);
  const markerRef = useRef<mapboxgl.Marker>(null);
  const toastIdInvalidToken = "invalid-token";
  const toastIdNoToken = "no-token";
  const initialLon = initialCenter ? initialCenter[0] : null;
  const initialLat = initialCenter ? initialCenter[1] : null;

  // TODO: how do we simplify this `useEffect()` without ill side effects like map repainting by e.g. breaking it up into multiples or moving anything outside of it? for example, can anything be derived on render instead? or can anything run in a useEffect that runs only in initial render with an empty array w/out complicating subsequent update logic?
  useEffect(() => {
    // TODO: can this if and the token assignment be moved into render? (without the early return); seems like it's just derived logic
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

    const center =
      initialLon && initialLat ? new LngLat(initialLon, initialLat) : null;

    if (!mapRef.current) {
      // TODO: look into adding "testMode: true" via eg `testMode: process.env.NODE_ENV === 'test'` for tests and/orCI environment; this mode uses no access token nor does it have WebGL visual output, so styles will have to be loaded from local sources)
      // initial pass: create map
      mapRef.current = new mapboxgl.Map({
        container: mapContainerRef.current!,
        ...(center ? { center } : {}), // use provided initial center if it exists, otherwise rely on default center in map style, if it exists
        ...mapOptions,
      });

      const map = mapRef.current;

      map.touchZoomRotate.disableRotation(); // turn off rotate w/touch

      const nav = new mapboxgl.NavigationControl({ showCompass: false });
      map.addControl(nav, "bottom-right");

      if (center && address) {
        console.log("set up markerRef.current for first time");
        markerRef.current = addMarker(center, map);
      }

      // wait for map to load before drawing marker
      map.on("load", () => {
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
      });
    } else {
      // subsequent passes: update map
      const map = mapRef.current;

      // only show map marker if there are proper coordinates and address
      if (center) {
        // coordinates exist
        if (address) {
          // address exists
          if (!markerRef.current) {
            // map marker does not yet exist, so create it
            console.log("set up markerRef.current for subsequent time");
            markerRef.current = addMarker(center, map);
          }
          console.log("update markerRef.current");
          markerRef.current.setLngLat(center);
        } else {
          // no address, so remove map marker if it exists
          if (markerRef.current) {
            console.log(
              "removing markerRef.current marker from map and setting to null"
            );
            markerRef.current?.remove();
            markerRef.current = null;
          }
        }
        map.panTo(center, { duration: 750 }); // pan to new center
      }

      return;
    }
  }, [
    initialLon,
    initialLat,
    address,
    liquefactionData,
    softStoryData,
    tsunamiData,
  ]);

  useEffect(() => {
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

    if (layerToggleObj.layerId != "") handleToggleLayers();
  }, [layerToggleObj]); // re-runs every time state changes

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default Map;
