import type { Metadata, Viewport } from 'next'
import './globals.css'
import { KonvaDragProvider } from '@/context/KonvaDragContext'

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
  userScalable: false,
}

export const metadata: Metadata = {
  title: 'LotPlanner for iPad Pro',
  description: 'Professional carnival lot planning application optimized for iPad Pro',
  other: {
    'apple-mobile-web-app-capable': 'yes',
    'mobile-web-app-capable': 'yes',
    'apple-mobile-web-app-status-bar-style': 'black-translucent',
    'apple-mobile-web-app-title': 'LotPlanner',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="h-full">
      <head>
        {/* Suppress hydration warnings for Windsurf development attributes */}
        <script dangerouslySetInnerHTML={{ __html: `
          // Only in development mode
          if (process.env.NODE_ENV === 'development') {
            const originalConsoleError = console.error;
            console.error = (...args) => {
              if (args[0]?.includes && args[0].includes('Hydration failed because')) {
                if (
                  args[0].includes('data-windsurf-page-id') ||
                  args[0].includes('data-windsurf-extension-id')
                ) {
                  return; // Suppress the warning
                }
              }
              originalConsoleError.apply(console, args);
            };
          }
        `}} />
      </head>
      <body className="h-full bg-ios-gray-light font-sf-pro antialiased">
        <KonvaDragProvider>
          {children}
        </KonvaDragProvider>
      </body>
    </html>
  )
}
