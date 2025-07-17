"use client";

import { ChakraProvider } from "@chakra-ui/react";
import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
import system from "../../../styles/theme";

export function Provider(props: ColorModeProviderProps) {
  return (
    <ChakraProvider value={system}>
      {/* TODO: this is a workaround to force the color mode to light for now until we figure out how to handle light vs dark properly */}
      <ColorModeProvider forcedTheme="light" {...props} />
    </ChakraProvider>
  );
}

// NOTE: below are alternate snippets in case the one above doesn't work as expected

// // TODO: this is (close to?) the original code from Chakra v2; it doesn't seem to work properly at all b/c there are no styles applied to the components ... may be b/c there is no longer a `@chakra-ui/next-js` to import from

// import { ChakraProvider } from "@chakra-ui/react";
// import system from "../../../styles/theme";

// export function Provider({
//   children,
//   ...props
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <ChakraProvider value={system} {...props}>
//       {children}
//     </ChakraProvider>
//   );
// }

// // TODO: this is a v3 snippet from this sandbox: https://github.com/chakra-ui/chakra-ui/blob/main/sandbox/next-app/app/provider.tsx; seems to work similarly to the first snippet without studying too carefully
// import { ChakraProvider } from "@chakra-ui/react";

// import { ThemeProvider } from "next-themes";
// // import { ColorModeProvider, type ColorModeProviderProps } from "./color-mode";
// import system from "../../../styles/theme";

// export default function Provider(props: { children: React.ReactNode }) {
//   return (
//     <ChakraProvider value={system}>
//       <ThemeProvider attribute="class" disableTransitionOnChange>
//         {props.children}
//       </ThemeProvider>
//     </ChakraProvider>
//   );
// }
