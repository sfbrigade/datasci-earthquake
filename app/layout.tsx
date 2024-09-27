import { Container } from "@chakra-ui/react";
import { Providers } from "./providers";

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
          <Container
            as="main"
            maxW="container.xl"
            padding="25px"
            bg="primary.900"
            color="white"
          >
            {children}
          </Container>
        </Providers>
      </body>
    </html>
  );
}
