"use client";

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
      <ColorModeProvider {...props}>{children}</ColorModeProvider>
    </ChakraProvider>
  );
}
