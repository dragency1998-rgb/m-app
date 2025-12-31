// src/app/layout.tsx
import type { Metadata } from 'next'
import { ReactNode } from 'react'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: 'Professional Next.js App',
  description: 'A professional Next.js application with TypeScript, Tailwind, Bootstrap 5, Firebase, and PWA support',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'Next App',
  },
  icons: [
    { rel: 'icon', url: '/favicon.ico' },
    { rel: 'apple-touch-icon', url: '/icons/icon-192x192.png' },
  ],
  viewport: 'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover',
}

interface RootLayoutProps {
  children: ReactNode
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="theme-color" content="#0066cc" />
        <meta name="mobile-web-app-capable" content="yes" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body>
        <div id="root">
          {children}
        </div>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker
                  .register('/sw.js')
                  .then(() => console.log('Service Worker registered'))
                  .catch((err) => console.log('Service Worker registration failed:', err));
              }
            `,
          }}
        />
      </body>
    </html>
  )
}
