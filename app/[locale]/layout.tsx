import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import '../globals.css';
import React from "react"
import { Analytics } from '@vercel/analytics/next'
import { Toaster } from "@/components/ui/sonner"
import { DM_Sans, Playfair_Display } from 'next/font/google'

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
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
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
