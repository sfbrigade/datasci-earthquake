import { Providers } from './providers'

export const metadata = {
  title: 'SF Quake Safe',
  description: 'Learn about your home\'s earthquake readiness',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
        <body>
          <Providers>{children}</Providers>
        </body>
    </html>
  )
}
