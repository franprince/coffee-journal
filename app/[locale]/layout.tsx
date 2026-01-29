import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import React from "react"
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "@/components/ui/sonner"
import {
    DM_Sans,
    Playfair_Display,
    Comfortaa as V0_Font_Comfortaa,
    Geist_Mono as V0_Font_Geist_Mono,
    Playfair_Display as V0_Font_Playfair_Display
} from 'next/font/google'

// Initialize fonts
const _comfortaa = V0_Font_Comfortaa({ subsets: ['latin'], weight: ["300", "400", "500", "600", "700"] })
const _geistMono = V0_Font_Geist_Mono({ subsets: ['latin'], weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"] })
const _playfairDisplay = V0_Font_Playfair_Display({ subsets: ['latin'], weight: ["400", "500", "600", "700", "800", "900"] })

const dmSans = DM_Sans({
    subsets: ["latin"],
    variable: '--font-dm-sans'
});

const playfair = Playfair_Display({
    subsets: ["latin"],
    variable: '--font-playfair'
});

export default async function LocaleLayout({
    children,
    params
}: {
    children: React.ReactNode;
    params: { locale: string };
}) {
    const { locale } = await params;
    // Providing all messages to the client
    // side is the easiest way to get started
    const messages = await getMessages();

    return (
        <html lang={locale}>
            <body className={`${dmSans.variable} ${playfair.variable} font-sans antialiased`}>
                <NextIntlClientProvider locale={locale} messages={messages}>
                    {children}
                </NextIntlClientProvider>
                <Analytics />
                <Toaster />
            </body>
        </html>
    );
}
