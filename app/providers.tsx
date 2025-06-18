"use client";

import { ChakraProvider } from "@chakra-ui/react";
import system from "../styles/theme";

export function Providers({
  children,
  ...props
}: {
  children: React.ReactNode;
}) {
  return (
    <ChakraProvider value={system} {...props}>
      {children}
    </ChakraProvider>
  );
}

// // TODO: This works, but then we don't have ColorModeProvider
// <ChakraProvider value={system} {...props}>
//   {children}
// </ChakraProvider>

// // TODO: ColorModeProvider is causing "https://nextjs.org/docs/messages/react-hydration-error
// import { ColorModeProvider } from "@/components/ui/color-mode";
// <ChakraProvider value={system}>
//   <ColorModeProvider {...props}>{children}</ColorModeProvider>
// </ChakraProvider>
