import type { Metadata, Viewport } from 'next'
import './globals.css'
import { UnifiedDragProvider } from '@/contexts/UnifiedDragContext'
import { CanvasScaleProvider } from '@/contexts/CanvasScaleContext'
import DragErrorBoundary from '@/components/DragErrorBoundary'
import ScaleAwareDragPreview from '@/components/ScaleAwareDragPreview'

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
        {/* Development-only script to suppress Windsurf hydration warnings */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
            if (typeof window !== 'undefined' && '${process.env.NODE_ENV}' === 'development') {
              const originalConsoleError = console.error;
              console.error = function(...args) {
                const message = args[0];
                if (typeof message === 'string' && (
                  message.includes('Windsurf') ||
                  message.includes('data-windsurf') ||
                  message.includes('hydration')
                )) {
                  return; // Suppress Windsurf-related hydration warnings
                }
                originalConsoleError.apply(console, args);
              };
            }
          `
          }}
        />
      </head>
      <body className="h-full bg-ios-gray-light font-sf-pro antialiased">
        <DragErrorBoundary>
          <CanvasScaleProvider>
            <UnifiedDragProvider>
              {children}
              <ScaleAwareDragPreview />
            </UnifiedDragProvider>
          </CanvasScaleProvider>
        </DragErrorBoundary>
      </body>
    </html>
  )
}
