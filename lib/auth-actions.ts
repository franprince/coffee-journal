'use server';

import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { headers } from 'next/headers';

export async function signInWithGoogle() {
    const supabase = await createClient();
    const origin = (await headers()).get('origin');

    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${origin}/auth/callback`,
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
    const origin = (await headers()).get('origin');

    const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
            emailRedirectTo: `${origin}/auth/callback`,
        },
    });

    if (error) {
        console.error('Email sign in error:', error);
        throw new Error(error.message);
    }

    return { success: true };
}

export async function verifyOtp(email: string, token: string) {
    const supabase = await createClient();

    const { error } = await supabase.auth.verifyOtp({
        email,
        token,
        type: 'email',
    });

    if (error) {
        console.error('OTP verification error:', error);
        throw new Error(error.message);
    }

    return { success: true };
}

export async function signOut() {
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect('/');
}
