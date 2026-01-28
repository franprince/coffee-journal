'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { signInWithGoogle, signInWithEmail, verifyOtp } from '@/lib/auth-actions';
import { useState } from 'react';
import { Mail, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

type AuthStep = 'options' | 'email-input' | 'otp-verify';

export function AuthDialog() {
    const t = useTranslations('Auth');
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<AuthStep>('options');
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmail(email);
            toast.success('Check your email for the verification code');
            setStep('otp-verify');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send verification email');
        } finally {
            setIsLoading(false);
        }
    };

    const handleOtpSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await verifyOtp(email, otp);
            toast.success('Successfully signed in!');
            setIsOpen(false);
            setStep('options');
            setEmail('');
            setOtp('');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Invalid verification code');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToOptions = () => {
        setStep('options');
        setEmail('');
        setOtp('');
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => {
            setIsOpen(open);
            if (!open) {
                setStep('options');
                setEmail('');
                setOtp('');
            }
        }}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full px-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all">
                    {t('signIn')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl p-8">
                <DialogHeader className="space-y-4 text-center">
                    <DialogTitle className="text-2xl font-serif font-bold text-primary italic">
                        {step === 'otp-verify' ? 'Enter Verification Code' : t('dialogTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {step === 'otp-verify'
                            ? `Enter the 6-digit code sent to ${email}`
                            : t('dialogDescription')}
                    </DialogDescription>
                </DialogHeader>

                {step === 'options' && (
                    <div className="flex flex-col gap-4 py-8">
                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 rounded-xl text-md font-medium flex items-center justify-center gap-3 border-border hover:bg-secondary/50 transition-colors"
                            onClick={() => signInWithGoogle()}
                        >
                            <Mail className="w-5 h-5 text-[#4285F4]" />
                            {t('signInWithGoogle')}
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t border-border" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">or</span>
                            </div>
                        </div>

                        <Button
                            type="button"
                            variant="outline"
                            className="h-12 rounded-xl text-md font-medium flex items-center justify-center gap-3 border-border hover:bg-secondary/50 transition-colors"
                            onClick={() => setStep('email-input')}
                        >
                            <KeyRound className="w-5 h-5" />
                            Continue with Email
                        </Button>
                    </div>
                )}

                {step === 'email-input' && (
                    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 py-8">
                        <Input
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12 rounded-xl"
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBackToOptions}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                            >
                                {isLoading ? 'Sending...' : 'Send Code'}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 'otp-verify' && (
                    <form onSubmit={handleOtpSubmit} className="flex flex-col gap-4 py-8">
                        <Input
                            type="text"
                            placeholder="000000"
                            value={otp}
                            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                            required
                            maxLength={6}
                            className="h-12 rounded-xl text-center text-2xl tracking-widest font-mono"
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBackToOptions}
                                className="flex-1"
                            >
                                Back
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading || otp.length !== 6}
                                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                            >
                                {isLoading ? 'Verifying...' : 'Verify'}
                            </Button>
                        </div>
                    </form>
                )}
            </DialogContent>
        </Dialog>
    );
}
