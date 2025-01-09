import dynamic from "next/dynamic";

const DynamicAddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false }
);

export default DynamicAddressAutofill;
