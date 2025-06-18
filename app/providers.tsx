"use client";

import { ColorModeProvider } from "@/components/ui/color-mode";
import { ChakraProvider } from "@chakra-ui/react";
import system from "../styles/theme";

export function Providers({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider value={system}>
      {/* TODO FIXME: does the ColorModeProvider still cause https://nextjs.org/docs/messages/react-hydration-error? May have to check during runtime in browser and/or Vercel */}
      <ColorModeProvider {...props}>{children}</ColorModeProvider>
    </ChakraProvider>
  );
}

// // TODO: This works, but then we don't have ColorModeProvider
// <ChakraProvider value={system} {...props}>
//   {children}
// </ChakraProvider>

// // TODO: ColorModeProvider is causing "https://nextjs.org/docs/messages/react-hydration-error
// <ChakraProvider value={system}>
//   <ColorModeProvider {...props}>{children}</ColorModeProvider>
// </ChakraProvider>
