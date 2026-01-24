import React from "react"
import type { Metadata, Viewport } from 'next'

import { Analytics } from '@vercel/analytics/next'
import './globals.css'
import { DM_Sans, Playfair_Display, Comfortaa as V0_Font_Comfortaa, Geist_Mono as V0_Font_Geist_Mono, Playfair_Display as V0_Font_Playfair_Display } from 'next/font/google'

// Initialize fonts
const _comfortaa = V0_Font_Comfortaa({ subsets: ['latin'], weight: ["300","400","500","600","700"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100","200","300","400","500","600","700","800","900"] })
const _playfairDisplay = V0_Font_Playfair_Display({ subsets: ['latin'], weight: ["400","500","600","700","800","900"] })

const dmSans = DM_Sans({ 
  subsets: ["latin"],
  variable: '--font-dm-sans'
});

const playfair = Playfair_Display({ 
  subsets: ["latin"],
  variable: '--font-playfair'
});

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
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
