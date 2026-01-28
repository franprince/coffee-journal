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
import { signInWithGoogle, signInWithEmail } from '@/lib/auth-actions';
import { useState } from 'react';
import { Mail, KeyRound, CheckCircle2 } from 'lucide-react';
import { toast } from 'sonner';

type AuthStep = 'options' | 'email-input' | 'email-sent';

export function AuthDialog() {
    const t = useTranslations('Auth');
    const [isOpen, setIsOpen] = useState(false);
    const [step, setStep] = useState<AuthStep>('options');
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleEmailSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            await signInWithEmail(email);
            setStep('email-sent');
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to send magic link');
        } finally {
            setIsLoading(false);
        }
    };

    const handleBackToOptions = () => {
        setStep('options');
        setEmail('');
    };

    const handleClose = () => {
        setIsOpen(false);
        // Reset after animation
        setTimeout(() => {
            setStep('options');
            setEmail('');
        }, 200);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" className="rounded-full px-6 border-accent text-accent hover:bg-accent hover:text-accent-foreground transition-all">
                    {t('signIn')}
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md rounded-3xl p-8">
                <DialogHeader className="space-y-4 text-center">
                    <DialogTitle className="text-2xl font-serif font-bold text-primary italic">
                        {step === 'email-sent' ? t('checkEmail') : t('dialogTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {step === 'email-sent'
                            ? t('sentLinkTo', { email })
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
                            <Mail className="w-5 h-5" />
                            {t('continueWithEmail')}
                        </Button>
                    </div>
                )}

                {step === 'email-input' && (
                    <form onSubmit={handleEmailSubmit} className="flex flex-col gap-4 py-8">
                        <Input
                            type="email"
                            placeholder={t('emailPlaceholder')}
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="h-12 rounded-xl"
                            autoFocus
                        />
                        <div className="flex gap-2">
                            <Button
                                type="button"
                                variant="ghost"
                                onClick={handleBackToOptions}
                                className="flex-1"
                            >
                                {t('back')}
                            </Button>
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="flex-1 h-12 rounded-xl bg-primary hover:bg-primary/90"
                            >
                                {isLoading ? t('sending') : t('sendLink')}
                            </Button>
                        </div>
                    </form>
                )}

                {step === 'email-sent' && (
                    <div className="flex flex-col items-center gap-6 py-8">
                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center">
                            <CheckCircle2 className="w-8 h-8 text-primary" />
                        </div>
                        <div className="text-center space-y-2">
                            <p className="text-sm text-muted-foreground">
                                {t('clickLinkToSignIn')}
                            </p>
                            <p className="text-xs text-muted-foreground">
                                {t('linkExpires')}
                            </p>
                        </div>
                        <Button
                            onClick={handleClose}
                            variant="outline"
                            className="w-full"
                        >
                            {t('close')}
                        </Button>
                    </div>
                )}
            </DialogContent>
        </Dialog>
    );
}
