import { Box, Flex } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster";
import { Providers } from "./providers";
import Header from "./components/header";
import Footer from "./components/footer";
import { defaultSystem } from "@chakra-ui/react";

import { Inter, Manrope } from "next/font/google";

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
            <Header />
            {/* before */}
            <Box flex="1" as="main" width="100%">
              {children}
            </Box>
            {/* after
            <Box flex="1" width="100%" asChild>
              <main>{children}</main>
            </Box> */}
            <Footer />
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
