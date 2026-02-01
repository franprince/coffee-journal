import React from "react"
import type { Metadata, Viewport } from 'next'


export const metadata: Metadata = {
  title: 'Brew Journal | Your Coffee Recipe Companion',
  description: 'A premium coffee journal app for tracking recipes, pour schedules, and brew logs. Perfect your pour-over technique.',
  generator: 'v0.app',
  icons: {
    icon: [
      {
        url: '/icon-light-32x32.png',
        media: '(prefers-color-scheme: light)',
      },
      {
        url: '/icon-dark-32x32.png',
        media: '(prefers-color-scheme: dark)',
      },
      {
        url: '/icon.svg',
        type: 'image/svg+xml',
      },
    ],
    apple: '/apple-icon.png',
  },
}

export const viewport: Viewport = {
  themeColor: '#f5efe6',
}

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}
