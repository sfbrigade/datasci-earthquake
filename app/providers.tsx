"use client";

// import { CacheProvider } from "@chakra-ui/next-js"; // TODO: double check if needed for v3 post-migration (@chakra-ui/next-js is no longer in `package.json`)

import { ColorModeProvider } from "@/components/ui/color-mode";
import { ChakraProvider } from "@chakra-ui/react";
import { system } from "../styles/theme";

export function Providers({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider value={system}>
      <ColorModeProvider {...props} />
    </ChakraProvider>
  );
}
