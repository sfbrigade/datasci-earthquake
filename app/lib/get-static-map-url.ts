type StaticMapUrlParams = {
  coordinates: readonly [number, number] | number[];
  zoom?: number;
  width?: number;
  height?: number;
  bearing?: number;
  pitch?: number;
};

const DEFAULT_STYLE_ID = "mapbox/standard";

export const getStaticMapUrl = ({
  coordinates,
  zoom = 12.1,
  width = 1280,
  height = 960,
  bearing = 0,
  pitch = 0,
}: StaticMapUrlParams) => {
  const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;

  if (!token || !coordinates?.length) {
    return null;
  }

  const [lng, lat] = coordinates;

  return `https://api.mapbox.com/styles/v1/${DEFAULT_STYLE_ID}/static/${lng},${lat},${zoom},${bearing},${pitch}/${width}x${height}@2x?access_token=${token}`;
};
