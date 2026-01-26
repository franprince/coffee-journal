import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { updateSession } from '@/lib/supabase/proxy';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware(routing);

export default async function middleware(request: NextRequest) {
    // Skip intl middleware for auth callback
    if (request.nextUrl.pathname.startsWith('/auth')) {
        return await updateSession(request, NextResponse.next());
    }

    const response = intlMiddleware(request);
    return await updateSession(request, response);
}

export const config = {
    // Match only internationalized pathnames + others for session refresh
    matcher: ['/', '/(es|en)/:path*', '/((?!_next|_vercel|.*\\..*).*)'],
};
