import { Box, Flex } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import Header from "./components/header";
import Footer from "./components/footer";
import { defaultSystem } from "@chakra-ui/react"; // TODO: is this necessary?

import { Inter, Manrope } from "next/font/google";
import { Suspense } from "react";
import HeaderSkeleton from "./components/header-skeleton";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
});

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
  return (
    <html lang="en">
      <body className={`${manrope.className} ${inter.className}`}>
        <Providers>
          <Flex direction="column" align="center" minH="100vh">
            <Suspense fallback={<HeaderSkeleton />}>
              <Header />
            </Suspense>
            <Box flex="1" as="main" width="100%">
              {children}
            </Box>
            <Footer />
          </Flex>
          {/* TODO FIXME: is this Toaster component declared in the right place? */}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
