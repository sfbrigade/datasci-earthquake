"use client";

import dynamic from "next/dynamic";
import { ComponentType } from "react";

// NOTE: we are forcing this third party lib to be loaded with `ssr = false`
// because it uses the `document` object, which is client-side only
const DynamicAddressAutofill = dynamic(
  () =>
    import("@mapbox/search-js-react").then((mod) => {
      // Ensure the component exists before returning
      if (!mod.AddressAutofill) {
        throw new Error("AddressAutofill component not found");
      }
      return mod.AddressAutofill as ComponentType<any>;
    }),
  {
    ssr: false,
  }
);

export default DynamicAddressAutofill;
