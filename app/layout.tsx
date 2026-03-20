import { Inter, Manrope } from "next/font/google";
import { Box, Flex } from "@chakra-ui/react";
import { Provider } from "@/components/ui/provider";
import Header from "./components/header";
import Footer from "./components/footer";
import { Toaster } from "@/components/ui/toaster";

// Trimmed to only the weights actually used in the design system.
// display: "swap" prevents FOIT (Flash of Invisible Text) and lets the browser
// show a fallback font immediately, improving FCP on slow connections.
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  display: "swap",
  variable: "--font-manrope",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata = {
  title: "SafeHome",
  description: "Learn about your home's earthquake readiness",
};

// Since this is the root layout, all fetch requests in the app
// that don't set their own cache option will be cached.
// Changed from "default-cache" to "force-cache": always serve from cache and
// revalidate on demand. GeoJSON datasets change infrequently; staleness for
// up to a day is acceptable and avoids unnecessary upstream fetches.
export const fetchCache = "force-cache";

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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload the SafeHome logo SVG — it is the first visible image above the fold
            on the home page (inside HomeHeader) and benefits from early discovery. */}
        <link rel="preload" href="/images/SFSafeHome-fulllogo.svg" as="image" type="image/svg+xml" />
      </head>
      <body className={`${manrope.className} ${inter.className}`}>
        <Provider>
          <Flex direction="column" align="center" minH="dvh">
            <Header />
            <Box flex="1" as="main" width="full">
              {children}
            </Box>
            <Footer />
          </Flex>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
