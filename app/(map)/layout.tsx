import { InterVariableName, ManropeVariableName } from "@/data/constants";
import { Inter, Manrope } from "next/font/google";
import { Metadata } from "next";
import { Provider } from "@/components/ui/provider";
import { Toaster } from "@/components/ui/toaster";

import Footer from "@/components/footer";
import Header from "@/components/header";
import { Flex, Box } from "@chakra-ui/react";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-manrope" satisfies typeof ManropeVariableName, // Define CSS variable for Manrope font
});
const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter" satisfies typeof InterVariableName, // Define CSS variable for Inter font
});

export const metadata: Metadata = {
  title: "SafeHome",
  description: "Learn about your home's earthquake readiness",
};

// Since this is the root layout, all fetch requests in the app
// that don't set their own cache option will be cached.
export const fetchCache = "default-cache";

export default function RootLayout({
  children,
  panel,
}: {
  children: React.ReactNode;
  panel: React.ReactNode;
}) {
  // NOTE: toggle off `suppressHydrationWarning` if you want to see hydration warnings in the console.
  // This can help identify issues with server-side rendering and client-side hydration.
  // However, it may also lead to a lot of warnings if your app is not fully optimized for hydration;
  // case in point: Chakra's Color Mode / ThemeProvider will cause this warning, which is the reason
  // this flag is toggled on.
  return (
    <html
      lang="en"
      className={`${manrope.variable} ${inter.variable}`}
      suppressHydrationWarning
    >
      <body>
        <Provider>
          <Flex direction="column" align="center" h="dvh">
            <Header />
            <Box flex="1" as="main" w="full" h="full" position="relative">
              {children}
              {panel}
            </Box>
            <Box as="footer" w="full" hideBelow="md">
              <Footer />
            </Box>
          </Flex>
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
