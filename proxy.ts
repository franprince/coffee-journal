import createMiddleware from 'next-intl/middleware';

const proxy = createMiddleware({
    // A list of all locales that are supported
    locales: ['es', 'en'],

    // Used when no locale matches
    defaultLocale: 'es'
});

export default proxy;

export const config = {
    // Match only internationalized pathnames
    matcher: ['/', '/(es|en)/:path*']
};
