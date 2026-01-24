'use client';

import * as React from 'react';
import { Palette, Check } from 'lucide-react';
import { useTheme, type Theme } from '@/components/theme-provider';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';

interface ThemeOption {
    value: Theme;
    label: string;
    color: string;
}

const themes: ThemeOption[] = [
    { value: 'neon', label: 'Neon Espresso', color: '#a62e8c' }, // rough primary match
    { value: 'nordic', label: 'Nordic Roast', color: '#134e4a' },
    { value: 'midnight', label: 'Midnight Tokyo', color: '#06b6d4' },
    { value: 'matcha', label: 'Matcha Zen', color: '#16a34a' },
    { value: 'cortado', label: 'Cortado Slate', color: '#ea580c' },
];

export function ThemeToggle() {
    const { theme, setTheme } = useTheme();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full w-9 h-9 border border-border/50 bg-background/50 backdrop-blur-sm">
                    <Palette className="h-4 w-4" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="glass-card border-border">
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.value}
                        onClick={() => setTheme(t.value)}
                        className={cn(
                            "flex items-center gap-2 cursor-pointer focus:bg-primary/10",
                            theme === t.value && "bg-primary/5 font-medium"
                        )}
                    >
                        <div
                            className="w-3 h-3 rounded-full border border-white/10 shadow-sm"
                            style={{ backgroundColor: t.color }}
                        />
                        <span className="flex-1">{t.label}</span>
                        {theme === t.value && <Check className="w-3 h-3 text-primary" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
