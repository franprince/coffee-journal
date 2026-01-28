'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signInWithGoogle() {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin');
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    // Fallback to host if origin is missing (common in some server environments)
    const redirectBase = origin || `${protocol}://${host}`;

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${redirectBase}/auth/callback`,
        },
    });

    if (error) {
        console.error('Google sign in error:', error);
        return;
    }

    if (data.url) {
        redirect(data.url);
    }
}

export async function signInWithEmail(email: string) {
    const supabase = await createClient();
    const headersList = await headers();
    const origin = headersList.get('origin');
    const host = headersList.get('host');
    const protocol = process.env.NODE_ENV === 'development' ? 'http' : 'https';

    const redirectBase = origin || `${protocol}://${host}`;

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${redirectBase}/auth/callback`,
        },
    });

    if (error) {
        console.error('Email sign in error:', error);
        throw new Error(error.message);
    }

    return { success: true };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}
