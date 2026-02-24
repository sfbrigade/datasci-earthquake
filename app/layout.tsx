import { Inter, Manrope } from "next/font/google";
import { Box, Flex } from "@chakra-ui/react";
import { Provider } from "@/components/ui/provider";
import HomeHeader from "./components/home-header";
import Footer from "./components/footer";
import { Toaster } from "@/components/ui/toaster";
// import { AddressSearchContext } from "./components/address-mapper";
// import { useState } from "react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

// TODO: commented out because can't export metadata from server component,
// Either implement ClientProviders (below) or try a state-management library

export const metadata = {
  title: "SafeHome",
  description: "Learn about your home's earthquake readiness",
};

// Since this is the root layout, all fetch requests in the app
// that don't set their own cache option will be cached.
export const fetchCache = "default-cache";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // NOTE: toggle off `suppressHydrationWarning` if you want to see hydration warnings in the console.
  // This can help identify issues with server-side rendering and client-side hydration.
  // However, it may also lead to a lot of warnings if your app is not fully optimized for hydration;
  // case in point: Chakra's Color Mode / ThemeProvider will cause this warning, which is the reason
  // this flag is toggled on.

  // const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
  // const [isSearchComplete, setIsSearchComplete] = useState(false);

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.className} ${inter.className}`}>
        <Provider>
          {/* <AddressSearchContext
            value={{
              searchedAddress,
              setSearchedAddress,
              isSearchComplete,
              setIsSearchComplete,
            }}
          > */}
            <Flex direction="column" align="center" minH="dvh">
              <HomeHeader />
              <Box flex="1" as="main" width="full">
                {children}
              </Box>
              <Footer />
            </Flex>
            <Toaster />
          {/* </AddressSearchContext> */}
        </Provider>
      </body>
    </html>
  );
}

// TODO: Implement ClientProviders?? OR attempt to use Jotai

// "use client";

// import { useState } from "react";
// import { AddressSearchContext } from "./address-mapper";
// import HomeHeader from "./home-header";
// import Footer from "./footer";
// import { Flex, Box } from "@chakra-ui/react";
// import { Toaster } from "@/components/ui/toaster";

// export default function ClientProviders({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   const [searchedAddress, setSearchedAddress] = useState<string | null>(null);
//   const [isSearchComplete, setIsSearchComplete] = useState(false);

//   return (
//     <AddressSearchContext.Provider
//       value={{
//         searchedAddress,
//         setSearchedAddress,
//         isSearchComplete,
//         setIsSearchComplete,
//       }}
//     >
//       <Flex direction="column" align="center" minH="dvh">
//         <HomeHeader />

//         <Box flex="1" as="main" width="full">
//           {children}
//         </Box>

//         <Footer />
//       </Flex>

//       <Toaster />
//     </AddressSearchContext.Provider>
//   );
// }


// import { Inter, Manrope } from "next/font/google";
// import { Provider } from "@/components/ui/provider";
// import ClientProviders from "./components/client-providers";

// const manrope = Manrope({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
// });

// const inter = Inter({
//   subsets: ["latin"],
//   weight: ["300", "400", "500", "600", "700", "800"],
// });

// export const metadata = {
//   title: "SafeHome",
//   description: "Learn about your home's earthquake readiness",
// };

// export const fetchCache = "default-cache";

// export default function RootLayout({
//   children,
// }: {
//   children: React.ReactNode;
// }) {
//   return (
//     <html lang="en" suppressHydrationWarning>
//       <body className={`${manrope.className} ${inter.className}`}>
//         <Provider>
//           <ClientProviders>{children}</ClientProviders>
//         </Provider>
//       </body>
//     </html>
//   );
// }
