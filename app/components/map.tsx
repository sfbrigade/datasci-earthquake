"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl, { LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";

const lookupCoordinates = {
  geometry: {
    type: "Point",
    coordinates: [-122.463733, 37.777448],
  },
};

const softStories = [
  { lng: -122.424145, lat: 37.80379 },
  { lng: -122.433985, lat: 37.7751 },
  { lng: -122.40082, lat: 37.76169 },
  { lng: -122.42539, lat: 37.7195 },
  { lng: -122.42698, lat: 37.7616 },
];

const Map = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);

  useEffect(() => {
    const mapboxToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

    if (!mapContainerRef.current || !mapboxToken) {
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
      });

      const map = mapRef.current;
      const nav = new mapboxgl.NavigationControl({ showCompass: false });
      map.addControl(nav, "top-right");

      map.on("load", () => {
        const el = document.createElement("div");
        const center = map.getCenter();

        const marker = new mapboxgl.Marker({
          anchor: "bottom",
          element: el,
          className: "marker",
          draggable: true,
        })
          .setLngLat(center)
          .addTo(map);

        softStories.forEach(({ lng, lat }) => {
          const el = document.createElement("div");

          const storyMarker = new mapboxgl.Marker({
            element: el,
            className: "soft-story",
            draggable: true,
          })
            .setLngLat(new LngLat(lng, lat))
            .addTo(map);
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
