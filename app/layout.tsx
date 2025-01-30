import { Providers } from "./providers";
// import Header from "./components/header";
// import Footer from "./components/footer";
import LayoutSection from "./components/layout-section";

import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/700.css";

export const metadata = {
  title: "SF Quake Safe",
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
          <LayoutSection>{children}</LayoutSection>
          {/* <Flex direction="column" align="center" minH="100vh">
            <Header />
            <Box flex="1" as="main" width="100%">
              {children}
            </Box>
            <Footer />
          </Flex> */}
        </Providers>
      </body>
    </html>
  );
}
