import { getStaticMapUrl } from "../lib/get-static-map-url";
import {
  DEFAULT_MAP_COORDS,
  DEFAULT_MAP_ZOOM,
  DEFAULT_STATIC_MAP_HEIGHT,
  DEFAULT_STATIC_MAP_WIDTH,
} from "../lib/map-defaults";

type StaticMapPlaceholderProps = {
  coordinates?: readonly [number, number] | number[];
  zoom?: number;
  alt?: string;
  height?: string;
};

const StaticMapPlaceholder = ({
  coordinates = DEFAULT_MAP_COORDS,
  zoom = DEFAULT_MAP_ZOOM,
  alt = "San Francisco map preview",
  height = "100%",
}: StaticMapPlaceholderProps) => {
  const src = getStaticMapUrl({
    coordinates,
    zoom,
    width: DEFAULT_STATIC_MAP_WIDTH,
    height: DEFAULT_STATIC_MAP_HEIGHT,
  });

  return (
    <div
      style={{
        position: "relative",
        width: "100%",
        height,
        overflow: "hidden",
        background: "#e2e8f0",
      }}
    >
      {src ? (
        <img
          src={src}
          alt={alt}
          loading="eager"
          fetchPriority="high"
          width={DEFAULT_STATIC_MAP_WIDTH}
          height={DEFAULT_STATIC_MAP_HEIGHT}
          style={{
            width: "100%",
            height: "100%",
            objectFit: "cover",
            display: "block",
          }}
        />
      ) : null}
      <div
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          background:
            "linear-gradient(110deg, rgba(255,255,255,0.05) 8%, rgba(255,255,255,0.22) 18%, rgba(255,255,255,0.05) 33%)",
          backgroundSize: "200% 100%",
          animation: "safehome-placeholder-shimmer 1.8s linear infinite",
        }}
      />
      <style>{`@keyframes safehome-placeholder-shimmer { 0% { background-position: 200% 0; } 100% { background-position: -200% 0; } }`}</style>
    </div>
  );
};

export default StaticMapPlaceholder;
