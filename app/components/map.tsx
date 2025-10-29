"use client";

import React, { useRef, useEffect, useState } from "react";
import mapboxgl, { LngLat } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import { toaster } from "@/components/ui/toaster";
import { LayerToggleObjProps } from "./address-mapper";
import { Box, chakra } from "@chakra-ui/react";
import { LayerIds, LayerDefaults } from "@/data/data";

const defaultCoords = [-122.463733, 37.777448];

interface MapProps {
  coordinates: number[];
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
  layerToggleObj: LayerToggleObjProps;
}

const Map: React.FC<MapProps> = ({
  coordinates = defaultCoords,
  softStoryData,
  tsunamiData,
  liquefactionData,
  layerToggleObj,
}: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>(undefined);
  const markerRef = useRef<mapboxgl.Marker>(undefined);
  const toastIdInvalidToken = "invalid-token";
  const toastIdNoToken = "no-token";
  const [softStoryColor, setSoftStoryColor] = useState(LayerDefaults[0]);
  const [liquefactionColor, setLiquefactionColor] = useState(LayerDefaults[1]);
  const [tsunamiColor, setTsunamiColor] = useState(LayerDefaults[2]);

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

  const handleColorChange = (
    layerId: string,
    color: string,
    opacity?: number
  ) => {
    if (!mapRef.current) return;
    const map = mapRef.current;

    if (layerId === "softStoriesLayer" && map.getLayer(layerId))
      map.setPaintProperty(layerId, "circle-color", color);
    else if (layerId && map.getLayer(layerId)) {
      map.setPaintProperty(layerId, "fill-color", color);
      if (opacity) map.setPaintProperty(layerId, "fill-opacity", opacity);
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
        style: "mapbox://styles/mapbox/standard",
        center: [-122.437, 37.768],
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
      });

      const map = mapRef.current;

      map.touchZoomRotate.disableRotation(); // turn off rotate w/touch

      const nav = new mapboxgl.NavigationControl({ showCompass: false });
      map.addControl(nav, "bottom-right");

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
      const addressLngLat = new LngLat(coordinates[0], coordinates[1]);
      map.panTo(addressLngLat);
      markerRef.current?.setLngLat(addressLngLat);
      return;
    }
  }, [coordinates, liquefactionData, softStoryData, tsunamiData]);

  useEffect(() => {
    if (layerToggleObj.layerId != "") handleToggleLayers();
  }, [layerToggleObj]); // re-runs every time state changes

  return (
    <>
      <Box
        position="absolute"
        bgColor="blueBackground"
        h={160}
        w={420}
        zIndex={15}
        top={0}
        right={0}
        padding={5}
      >
        <chakra.form>
          <chakra.label display={"flex"} mb={3}>
            <b style={{ color: "white", marginRight: "15px" }}>
              {LayerIds[0]}:
            </b>
            <input
              type="text"
              value={softStoryColor.color}
              style={{ width: "90px", marginRight: "10px" }}
              onChange={(e) =>
                setSoftStoryColor({
                  color: e.target.value,
                  opacity: softStoryColor.opacity,
                })
              }
            />
            <div
              style={{
                color: "white",
                cursor: "pointer",
                border: "2px solid white",
                paddingInline: "4px",
              }}
              onClick={() =>
                handleColorChange(
                  LayerIds[0],
                  softStoryColor.color,
                  softStoryColor.opacity
                )
              }
            >
              Update
            </div>
          </chakra.label>
          <chakra.label display={"flex"} mb={3}>
            <b style={{ color: "white", marginRight: "15px" }}>
              {LayerIds[1]}:
            </b>
            <input
              type="text"
              value={liquefactionColor.color}
              style={{ width: "90px", marginRight: "15px" }}
              onChange={(e) =>
                setLiquefactionColor({
                  color: e.target.value,
                  opacity: liquefactionColor.opacity,
                })
              }
            />
            <input
              type="number"
              min={0}
              max={1}
              value={liquefactionColor.opacity}
              style={{ width: "50px", marginRight: "10px" }}
              onChange={(e) =>
                setLiquefactionColor({
                  color: liquefactionColor.color,
                  opacity: +e.target.value,
                })
              }
            />
            <div
              style={{
                color: "white",
                cursor: "pointer",
                border: "2px solid white",
                paddingInline: "4px",
              }}
              onClick={() =>
                handleColorChange(
                  LayerIds[1],
                  liquefactionColor.color,
                  liquefactionColor.opacity
                )
              }
            >
              Update
            </div>
          </chakra.label>
          <chakra.label display={"flex"}>
            <b style={{ color: "white", marginRight: "15px" }}>
              {LayerIds[2]}:
            </b>
            <input
              type="text"
              value={tsunamiColor.color}
              style={{ width: "90px", marginRight: "15px" }}
              onChange={(e) =>
                setTsunamiColor({
                  color: e.target.value,
                })
              }
            />
            <input
              type="number"
              min={0}
              max={1}
              value={tsunamiColor.opacity}
              style={{ width: "50px", marginRight: "10px" }}
              onChange={(e) =>
                setTsunamiColor({
                  color: tsunamiColor.color,
                  opacity: +e.target.value,
                })
              }
            />
            <div
              style={{
                color: "white",
                cursor: "pointer",
                border: "2px solid white",
                paddingInline: "4px",
              }}
              onClick={() =>
                handleColorChange(
                  LayerIds[2],
                  tsunamiColor.color,
                  tsunamiColor.opacity
                )
              }
            >
              Update
            </div>
          </chakra.label>
        </chakra.form>
      </Box>
      <div ref={mapContainerRef} style={{ width: "100%", height: "100%" }} />
    </>
  );
};

export default Map;
