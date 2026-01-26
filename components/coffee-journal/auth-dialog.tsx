'use client';

import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
import { signInWithGoogle, signInWithTwitter } from '@/lib/auth-actions';
import { useState } from 'react';
import { Mail, Twitter } from 'lucide-react';

export function AuthDialog() {
    const t = useTranslations('Auth');
    const [isOpen, setIsOpen] = useState(false);

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
                        {t('dialogTitle')}
                    </DialogTitle>
                    <DialogDescription className="text-muted-foreground">
                        {t('dialogDescription')}
                    </DialogDescription>
                </DialogHeader>
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
                    <Button
                        type="button"
                        variant="outline"
                        className="h-12 rounded-xl text-md font-medium flex items-center justify-center gap-3 border-border hover:bg-secondary/50 transition-colors"
                        onClick={() => signInWithTwitter()}
                    >
                        <Twitter className="w-5 h-5 text-[#1DA1F2]" />
                        {t('signInWithTwitter')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
