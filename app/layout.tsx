import { Box, Container, Flex } from "@chakra-ui/react";
import { Providers } from "./providers";
import Header from "./components/header";
import Footer from "./components/footer";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

import { Manrope } from "next/font/google";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
});

export const metadata = {
  title: "SF Safe Home",
  description: "Learn about your home's earthquake readiness",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Providers>
          <Flex
            className={manrope.className}
            direction="column"
            align="center"
            minH="100vh"
          >
            <Header />
            <Box flex="1" as="main" width="100%">
              {children}
            </Box>
            <Footer />
          </Flex>
        </Providers>
      </body>
    </html>
  );
}
