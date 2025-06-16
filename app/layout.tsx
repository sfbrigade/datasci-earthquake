import { Box, Flex } from "@chakra-ui/react";
import { Providers } from "./providers";
import Header from "./components/header";
import Footer from "./components/footer";
import { Toaster } from "@/components/ui/toaster";
// TODO: do we need import { defaultSystem } from "@chakra-ui/react"; here?

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
            <Box flex="1" as="main" width="100%">
              {children}
            </Box>
            <Box>
              <Footer />
            </Box>
            <Toaster />
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
