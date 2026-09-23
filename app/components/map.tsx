"use client";

import React, { useRef, useEffect } from "react";
import mapboxgl, { LngLat, MapOptions } from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { FeatureCollection, Geometry } from "geojson";
import { toaster } from "@/components/ui/toaster";
import { LayerToggleObjProps } from "./address-mapper";
import { Box } from "@chakra-ui/react";
import system from "../../styles/theme";

import { resolveColorToken } from "../../styles/resolve-color-token";

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
      lightPreset: "day",
      colorRoads: "#fefefe", // matches the lightPreset "dawn" basemap so roads appear invisible with theme "monochrome"
    },
  },
};
interface MapProps {
  lon: number;
  lat: number;
  address: string | null;
  softStoryData: FeatureCollection<Geometry>;
  tsunamiData: FeatureCollection<Geometry>;
  liquefactionData: FeatureCollection<Geometry>;
  femaRiskData: FeatureCollection<Geometry>;
  landslideData: FeatureCollection<Geometry>;
  layerToggleObj: LayerToggleObjProps;
  /** Fraction of the container height covered at the bottom. */
  bottomPaddingRatio?: number;
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
  lon,
  lat,
  address,
  softStoryData,
  tsunamiData,
  liquefactionData,
  femaRiskData,
  landslideData,
  layerToggleObj,
  bottomPaddingRatio = 0,
}: MapProps) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map>(null);
  const markerRef = useRef<mapboxgl.Marker>(null);
  const toastIdInvalidToken = "invalid-token";
  const toastIdNoToken = "no-token";
  const lastLon = useRef<number | null>(lon);
  const lastLat = useRef<number | null>(lat);
  const ratioRef = useRef(0);
  const tsunamiVisibilityRef = useRef<"visible" | "none">("visible");
  const bottomPaddingPx = (ratio: number) =>
    Math.round((mapContainerRef.current?.clientHeight ?? 0) * ratio);

  useEffect(() => {
    ratioRef.current = bottomPaddingRatio;
    const map = mapRef.current;
    if (!map) return;

    const bottom = bottomPaddingPx(bottomPaddingRatio);
    if (map.getPadding().bottom !== bottom) {
      map.easeTo({ padding: { bottom }, duration: map.loaded() ? 750 : 0 });
    }
  }, [bottomPaddingRatio]);

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

    const center = lon && lat ? new LngLat(lon, lat) : null;

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
      map.setPadding({ bottom: bottomPaddingPx(ratioRef.current) });

      if (center && address) {
        // set up map marker for first time and set its center
        markerRef.current = addMarker(center, map);
      }

      map.on("load", () => {
        const tsunamiColor = resolveColorToken("colors.tsunami");

        // Add sources
        map.addSource("seismic", { type: "geojson", data: liquefactionData });

        map.addSource("tsunami", { type: "geojson", data: tsunamiData });

        map.addSource("fema-risk", { type: "geojson", data: femaRiskData });

        map.addSource("landslide", { type: "geojson", data: landslideData });

        // FEMA earthquake risk — broad background layer
        map.addLayer({
          id: "femaRiskLayer",
          source: "fema-risk",
          type: "fill",
          slot: "middle",
          // TODO: use mix of color and opacity tokens for this so legend etc matches up
          paint: {
            "fill-color": resolveColorToken("colors.femaRisk"),
            "fill-opacity": [
              "match",
              ["get", "fema_risk_rating"],

              "Relatively Low",
              0.015,
              "Relatively Moderate",
              0.035,
              "Relatively High",
              0.08,
              "Very High",
              0.18,

              0,
            ],
          },
        });

        // Landslide — fill sits below the liquefaction outlines and tsunami hatch
        map.addLayer({
          id: "landslideLayer",
          source: "landslide",
          type: "fill",
          slot: "middle",
          paint: {
            "fill-color": resolveColorToken("colors.landslide"),
            "fill-opacity": 0.4,
          },
        });

        // Liquefaction — extremely faint interior tint
        map.addLayer({
          id: "seismicBackgroundLayer",
          source: "seismic",
          type: "fill",
          slot: "middle",
          paint: {
            "fill-color": system.token("colors.orange.300"),
            "fill-opacity": 0.04,
          },
        });

        // Liquefaction — dark edge on OUTSIDE of polygon
        map.addLayer({
          id: "seismicBorderOuterLayer",
          source: "seismic",
          type: "line",
          slot: "middle",
          paint: {
            "line-color": system.token("colors.orange.600"),
            "line-width": 2,
            "line-offset": -1,
            "line-opacity": 0.9,
          },
        });

        // Liquefaction — softer/light band extending INSIDE polygon
        map.addLayer({
          id: "seismicBorderInnerLayer",
          source: "seismic",
          type: "line",
          slot: "middle",
          paint: {
            "line-color": system.token("colors.orange.300"),
            "line-width": 6,
            "line-offset": 3,
            "line-opacity": 0.35,
            "line-blur": 0.75,
          },
        });

        map.addLayer({
          id: "tsunamiInnerLayer",
          source: "tsunami",
          type: "fill",
          slot: "middle",
          paint: {
            "fill-color": tsunamiColor, // NOTE: this won't work if we intro light/dark mode; at point, we'd have to eg re-resolve the color on color mode change
            "fill-opacity": 0.25,
          },
        });

        map.loadImage("/images/tsunami-hatch-fine-16.png", (error, image) => {
          if (error) {
            console.error("Failed to load tsunami hatch:", error);
            return;
          }

          if (!image) return;

          if (!map.hasImage("tsunami-hatch")) {
            map.addImage("tsunami-hatch", image);

            map.addLayer({
              id: "tsunamiLayer",
              source: "tsunami",
              type: "fill",
              slot: "middle",
              paint: {
                "fill-pattern": "tsunami-hatch",
              },
            });
            map.setLayoutProperty(
              "tsunamiLayer",
              "visibility",
              tsunamiVisibilityRef.current
            );
          }
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

      const updateBasemapDetail = () => {
        const detailed = map.getZoom() >= 13;

        map.setConfigProperty("basemap", "showRoadLabels", detailed);

        map.setConfigProperty("basemap", "showPedestrianRoads", detailed);

        map.setConfigProperty("basemap", "showPointOfInterestLabels", detailed);

        map.setConfigProperty(
          "basemap",
          "colorRoads",
          detailed ? "#cccccc" : "#fefefe"
        );
      };

      map.on("zoomend", updateBasemapDetail);
      updateBasemapDetail();
    } else {
      // subsequent passes: update map
      const map = mapRef.current;

      // only show map marker if there are proper coordinates and address
      if (center) {
        // coordinates exist
        if (address) {
          // address exists
          if (!markerRef.current) {
            // map marker does not exist, so create it
            markerRef.current = addMarker(center, map);
          }
          // update center of map marker
          markerRef.current.setLngLat(center);
        } else {
          // no address, so remove map marker if it exists
          if (markerRef.current) {
            markerRef.current?.remove();
            markerRef.current = null;
          }
        }
        // only pan if current map center is different from new center
        if (
          map.getCenter().lng !== center.lng ||
          map.getCenter().lat !== center.lat
        ) {
          map.easeTo({
            center,
            padding: { bottom: bottomPaddingPx(ratioRef.current) },
            duration: 750,
          });
          lastLon.current = lon;
          lastLat.current = lat;
        }
      }
      return;
    }
  }, [
    lon,
    lat,
    address,
    liquefactionData,
    softStoryData,
    tsunamiData,
    femaRiskData,
    landslideData,
  ]);

  useEffect(() => {
    if (layerToggleObj.layerIds.includes("tsunamiLayer")) {
      tsunamiVisibilityRef.current = layerToggleObj.toggleState
        ? "visible"
        : "none";
    }

    const handleToggleLayers = () => {
      if (!mapRef.current) return;
      const map = mapRef.current;
      const newVisibility = layerToggleObj.toggleState ? "visible" : "none";

      layerToggleObj.layerIds.forEach((layerId) => {
        if (map.getLayer(layerId)) {
          // sets new visibility property value for each layer in a hazard visualization
          map.setLayoutProperty(layerId, "visibility", newVisibility);
        }
      });
    };

    if (layerToggleObj.layerIds.length > 0) handleToggleLayers();
  }, [layerToggleObj]); // re-runs every time state changes

  useEffect(() => {
    const container = mapContainerRef.current;
    if (!container || typeof ResizeObserver === "undefined") return;

    const observer = new ResizeObserver(() => {
      const map = mapRef.current;
      if (!map) return;

      map.resize();
      const bottom = bottomPaddingPx(ratioRef.current);
      if (map.getPadding().bottom !== bottom) {
        map.setPadding({ bottom });
      }
    });
    observer.observe(container);

    return () => observer.disconnect();
  }, []);

  return <Box ref={mapContainerRef} w="full" h="full" />;
};

export default Map;
