'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import type { RoastLevel } from '@/lib/types';
import { useTranslations } from 'next-intl';

interface RoastLevelSelectorProps {
    value: RoastLevel;
    onChange: (value: RoastLevel) => void;
}

export const ROAST_LEVELS: { id: RoastLevel; color: string; label: string }[] = [
    { id: 'light', color: '#D4A373', label: 'Light' },
    { id: 'medium-light', color: '#BC8A5F', label: 'Med-Light' }, // Adding to bridge the gap
    { id: 'medium', color: '#A47148', label: 'Medium' },
    { id: 'medium-dark', color: '#8B5A2B', label: 'Med-Dark' },
    { id: 'dark', color: '#5C3D2E', label: 'Dark' },
];

export function RoastLevelSelector({ value, onChange }: RoastLevelSelectorProps) {
    const t = useTranslations('CoffeeManager'); // Assuming we add translations later, using hardcoded for now or keys

    return (
        <div className="w-full pt-6 pb-2">
            <div className="relative flex justify-between px-2">
                {/* ROAST_LEVELS mapping */}

                {ROAST_LEVELS.map((level) => {
                    const isSelected = value === level.id;

                    return (
                        <div key={level.id} className="flex flex-col items-center gap-2 group cursor-pointer" onClick={() => onChange(level.id)}>
                            {/* Arrow Indicator */}
                            <div className="h-4 w-full flex justify-center mb-1">
                                {isSelected && (
                                    <motion.div
                                        layoutId="roast-arrow"
                                        className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-primary"
                                        initial={false}
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                            </div>

                            {/* Bean Icon */}
                            {/* Bean Icon */}
                            <div
                                className={cn(
                                    "transition-transform duration-200 flex items-center justify-center",
                                    isSelected ? "scale-110 drop-shadow-md" : "hover:scale-105 opacity-80 hover:opacity-100"
                                )}
                            >
                                {/* Elongated Bean Path */}
                                <svg
                                    viewBox="0 0 24 32"
                                    fill="none"
                                    className="w-8 h-12 drop-shadow-sm"
                                    style={{ color: level.color }}
                                >
                                    <path
                                        d="M12 2C6.5 2 3 8 3 16C3 24 6.5 30 12 30C17.5 30 21 24 21 16C21 8 17.5 2 12 2Z"
                                        fill="currentColor"
                                    />
                                    <path
                                        d="M12 4C10 10 14 20 12 28"
                                        stroke="rgba(0,0,0,0.3)"
                                        strokeWidth="1.5"
                                        strokeLinecap="round"
                                    />
                                </svg>
                            </div>

                            {/* Label */}
                            <span className={cn(
                                "text-[10px] sm:text-xs font-medium uppercase tracking-wider transition-colors pt-1",
                                isSelected ? "text-primary" : "text-muted-foreground"
                            )}>
                                {level.label}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
