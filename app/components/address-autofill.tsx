"use client";

import dynamic from "next/dynamic";
// NOTE: we are forcing this third party lib to be loaded with `ssr = false`
// because it uses the `document` object, which is client-side only
const AddressAutofill = dynamic(
  () => import("@mapbox/search-js-react").then((mod) => mod.AddressAutofill),
  { ssr: false }
);

export default function DynamicAddressAutofill(props: any) {
  return <AddressAutofill {...props} />;
}
