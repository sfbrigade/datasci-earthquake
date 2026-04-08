import { useSearchParams } from "next/navigation";

export function useAddressFromSearchParams() {
  const searchParams = useSearchParams();

  const lat = searchParams.get("lat");
  const lon = searchParams.get("lon");
  const address = searchParams.get("address");

  const coordinates = lat && lon ? [parseFloat(lon), parseFloat(lat)] : null;

  const coordinateKey =
    lat && lon ? `${parseFloat(lon)},${parseFloat(lat)}` : null;

  return { coordinates, coordinateKey, address };
}
