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
  title: "SafeHome – Check Your Home's Earthquake Risk in San Francisco",
  description:
    "SafeHome helps San Francisco residents look up their address to see whether their home is in a liquefaction zone, tsunami inundation zone, or is on a soft-story building list. Free, open-source, powered by City of San Francisco open data.",
  openGraph: {
    title: "SafeHome – Check Your SF Home's Earthquake Risk",
    description:
      "Instantly look up any San Francisco address: liquefaction zone, tsunami risk, and soft-story building status. Free tool from SF Civic Tech.",
    type: "website",
    url: "https://sfhazards.com",
    siteName: "SafeHome",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "SafeHome – Check Your SF Home's Earthquake Risk",
    description:
      "Free SF address look-up: liquefaction, tsunami, and soft-story building risk. Powered by City of San Francisco open data.",
  },
  alternates: {
    canonical: "https://sfhazards.com",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, "max-snippet": -1, "max-image-preview": "large" },
  },
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
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preload the SafeHome logo SVG — it is the first visible image above the fold
            on the home page (inside HomeHeader) and benefits from early discovery. */}
        <link rel="preload" href="/images/SFSafeHome-fulllogo.svg" as="image" type="image/svg+xml" />
        {/* Pre-warm connections to Mapbox CDN endpoints used for map style, tiles, and events.
            Each saved handshake is ~1 RTT (~150 ms under our throttle profile). */}
        <link rel="preconnect" href="https://api.mapbox.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://events.mapbox.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://a.tiles.mapbox.com" />
        <link rel="dns-prefetch" href="https://b.tiles.mapbox.com" />
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
