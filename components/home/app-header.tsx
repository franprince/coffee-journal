'use client';

import { useTranslations } from 'next-intl';
import { Coffee as CoffeeIcon, Plus, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthDialog, UserNav } from '@/components/shared';
import type { User } from '@supabase/supabase-js';

interface AppHeaderProps {
    user: User | null;
    className?: string;
    onNewRecipe: () => void;
    onOpenSettings: () => void;
}

export function AppHeader({ user, onNewRecipe, onOpenSettings }: AppHeaderProps) {
    const t = useTranslations('HomePage');
    const tSettings = useTranslations('Settings');

    return (
        <header className="sticky top-0 z-50 bg-background border-b border-border">
            <div className="max-w-5xl mx-auto px-4 py-4 md:py-6">
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary text-primary-foreground border border-primary">
                            <CoffeeIcon className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="font-serif text-2xl font-bold tracking-tight text-primary">
                                Brew Journal
                            </h1>
                        </div>
                    </div>

                    <div className="flex items-center gap-4">
                        {user ? (
                            <>
                                <Button
                                    onClick={onNewRecipe}
                                    className="rounded-full bg-accent text-accent-foreground hover:bg-accent/90 font-medium shadow-none border border-transparent px-6"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {t('addRecipe')}
                                </Button>
                                <UserNav user={user} />
                            </>
                        ) : (
                            <>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    className="text-muted-foreground hover:text-foreground"
                                    onClick={onOpenSettings}
                                    aria-label={tSettings('title')}
                                >
                                    <Settings className="w-5 h-5" />
                                </Button>
                                <AuthDialog />
                            </>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
}
