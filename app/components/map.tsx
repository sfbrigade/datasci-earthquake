"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl, { LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import seismicData from "../../seismic-20241121.json";
import tsunamiData from "../../tsunami-20241121.json";
import softStoriesData from "../../soft-stories-20241123.json";

// TODO: this is mock data sourced from datasf.org; replace w/eg API calls and pass in
const typedSeismicData: FeatureCollection<Geometry> =
  seismicData as FeatureCollection<Geometry>;
const typedTsunamiData: FeatureCollection<Geometry> =
  tsunamiData as FeatureCollection<Geometry>;
const typedSoftStoriesData: FeatureCollection<Geometry> =
  softStoriesData as FeatureCollection<Geometry>;

const addressLookupCoordinates = {
  geometry: {
    type: "Point",
    coordinates: [-122.463733, 37.777448],
  },
};
const coords = addressLookupCoordinates.geometry.coordinates;
const addressLngLat = new LngLat(coords[0], coords[1]);

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapContainerRef.current || !mapboxToken) {
      // TODO: turn this into a toast with friendly error message
      console.error("Mapbox access token or container is not set!");
      return;
    }

    mapboxgl.accessToken = mapboxToken;

    if (mapRef.current) {
      return;
    } else {
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
        config: {
          // Initial configuration for the Mapbox Standard style set above. By default, its ID is `basemap`.
          basemap: {
            // 'default', 'faded', or 'monochrome'
            theme: "default",
          },
        },
      });

      const map = mapRef.current;

      const nav = new mapboxgl.NavigationControl({ showCompass: false });
      map.addControl(nav, "top-right");

      map.on("load", () => {
        // Draw address marker
        const el = document.createElement("div");

        const addressMarker = new mapboxgl.Marker({
          anchor: "bottom",
          element: el,
          className: "marker",
        })
          .setLngLat(addressLngLat)
          .addTo(map);

        // Add sources
        map.addSource("seismic", {
          type: "geojson",
          data: typedSeismicData,
        });

        map.addSource("tsunami", {
          type: "geojson",
          data: typedTsunamiData,
        });

        map.addSource("soft-stories", {
          type: "geojson",
          data: typedSoftStoriesData,
        });

        // Add layers
        map.addLayer({
          id: "seismicLayer",
          source: "seismic",
          type: "fill",
          paint: {
            "fill-color": "#F6AD55", // orange/300
            "fill-opacity": 0.25, // 25% opacity
          },
        });

        map.addLayer({
          id: "tsunamiLayer",
          source: "tsunami",
          type: "fill",
          paint: {
            "fill-color": "#ED64A6", // pink/400
            "fill-opacity": 0.25, // 25% opacity
          },
        });

        map.addLayer({
          id: "softStoriesLayer",
          source: "soft-stories",
          type: "circle",
          paint: {
            "circle-radius": 4.5,
            "circle-stroke-width": 1,
            "circle-stroke-color": "#FFFFFF",
            "circle-color": "#171923", // gray/900
          },
        });
      });

      return () => {
        if (mapRef.current) mapRef.current.remove();
      };
    }
  }, []);

  return (
    <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
  );
};

export default Map;
