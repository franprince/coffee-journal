import { render, screen, fireEvent } from '@testing-library/react';
import { AuthDialog } from './auth-dialog';
import { NextIntlClientProvider } from 'next-intl';
import messages from '../../messages/en.json';
import { describe, it, expect, vi } from 'vitest';

// Mock the auth actions
vi.mock('@/lib/auth-actions', () => ({
    signInWithGoogle: vi.fn(),
    signInWithEmail: vi.fn(),
}));

const renderWithIntl = (ui: React.ReactElement) => {
    return render(
        <NextIntlClientProvider locale="en" messages={messages}>
            {ui}
        </NextIntlClientProvider>
    );
};

describe('AuthDialog', () => {
    it('opens the dialog when the sign in button is clicked', () => {
        renderWithIntl(<AuthDialog />);

        const signInButton = screen.getByRole('button', { name: /sign in/i });
        fireEvent.click(signInButton);

        expect(screen.getByRole('dialog')).toBeInTheDocument();
        expect(screen.getByText(/welcome to brew journal/i)).toBeInTheDocument();
    });

    it('shows email input step when "Continue with Email" is clicked', () => {
        renderWithIntl(<AuthDialog />);

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        fireEvent.click(screen.getByRole('button', { name: /continue with email/i }));

        expect(screen.getByPlaceholderText(/enter your email/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /back/i })).toBeInTheDocument();
    });

    it('returns to options step from email input step', () => {
        renderWithIntl(<AuthDialog />);

        fireEvent.click(screen.getByRole('button', { name: /sign in/i }));
        fireEvent.click(screen.getByRole('button', { name: /continue with email/i }));
        fireEvent.click(screen.getByRole('button', { name: /back/i }));

        expect(screen.getByRole('button', { name: /continue with google/i })).toBeInTheDocument();
    });
});
