import { Box, Flex } from "@chakra-ui/react";
import { Toaster } from "@/components/ui/toaster";
import { Provider } from "@/components/ui/provider";
import Header from "./components/header";
import Footer from "./components/footer";
import { defaultSystem } from "@chakra-ui/react"; // TODO: is this necessary?

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
  // NOTE: toggle off `suppressHydrationWarning` if you want to see hydration warnings in the console.
  // This can help identify issues with server-side rendering and client-side hydration.
  // However, it may also lead to a lot of warnings if your app is not fully optimized for hydration;
  // case in point: Chakra's Color Mode / ThemeProvider will cause this warning, which is the reason
  // this flag is toggled on.
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${manrope.className} ${inter.className}`}>
        <Provider>
          <Flex direction="column" align="center" minH="100vh">
            <Header />
            <Box flex="1" as="main" width="100%">
              {children}
            </Box>
            <Footer />
          </Flex>
          {/* TODO FIXME: is this Toaster component declared in the right place? */}
          <Toaster />
        </Provider>
      </body>
    </html>
  );
}
