'use client';

import { useTranslations } from 'next-intl';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { signOut } from '@/lib/auth-actions';
import { LogOut, User, Settings } from 'lucide-react';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { useState } from 'react';
import { SettingsDialog } from './settings-dialog';
import { useLocale } from 'next-intl';

interface UserNavProps {
    user: SupabaseUser;
}

export function UserNav({ user }: UserNavProps) {
    const t = useTranslations('Auth');
    const tSettings = useTranslations('Settings');
    const [isSettingsOpen, setIsSettingsOpen] = useState(false);
    const locale = useLocale();

    const initials = user.email ? user.email.substring(0, 2).toUpperCase() : 'U';
    const name = user.user_metadata?.full_name || user.email;

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full p-0 hover:bg-transparent focus-visible:ring-offset-0">
                    <Avatar className="h-10 w-10 border border-accent/20">
                        <AvatarImage src={user.user_metadata?.avatar_url} alt={name} />
                        <AvatarFallback className="bg-secondary text-primary font-bold">
                            {initials}
                        </AvatarFallback>
                    </Avatar>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 rounded-2xl p-2" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1 py-1 px-1">
                        <p className="text-sm font-bold leading-none">{name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                            {user.email}
                        </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                    className="rounded-xl flex items-center h-10 cursor-pointer transition-colors"
                    onClick={() => setIsSettingsOpen(true)}
                >
                    <Settings className="mr-3 h-4 w-4" />
                    <span>{tSettings('title')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem
                    className="rounded-xl flex items-center h-10 cursor-pointer focus:bg-destructive/10 focus:text-destructive text-destructive transition-colors"
                    onClick={() => signOut()}
                >
                    <LogOut className="mr-3 h-4 w-4" />
                    <span>{t('signOut')}</span>
                </DropdownMenuItem>
            </DropdownMenuContent>

            <SettingsDialog
                open={isSettingsOpen}
                onOpenChange={setIsSettingsOpen}
            />
        </DropdownMenu>
    );
}
