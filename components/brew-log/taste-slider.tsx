'use client';

import { useTranslations } from 'next-intl';
import { Slider } from '@/components/ui/slider';
import { Zap, Candy, Circle, AlertTriangle } from 'lucide-react';
import type { TasteProfile } from '@/lib/types';

interface TasteSliderProps {
    tasteProfile: TasteProfile;
    onChange: (key: keyof TasteProfile, value: number) => void;
}

const TASTE_DIMENSIONS = [
    { key: 'acidity' as const, icon: Zap },
    { key: 'sweetness' as const, icon: Candy },
    { key: 'body' as const, icon: Circle },
    { key: 'bitterness' as const, icon: AlertTriangle },
];

export function TasteSlider({ tasteProfile, onChange }: TasteSliderProps) {
    const tTaste = useTranslations('Taste');

    return (
        <div className="space-y-3">
            {TASTE_DIMENSIONS.map(({ key, icon: Icon }) => (
                <div key={key} className="space-y-1">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                            <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                            <span className="text-xs font-medium text-foreground">{tTaste(key)}</span>
                        </div>
                        <span className="text-xs text-muted-foreground font-mono">
                            {tasteProfile[key]}%
                        </span>
                    </div>
                    <Slider
                        value={[tasteProfile[key]]}
                        onValueChange={(val) => onChange(key, val[0])}
                        max={100}
                        step={5}
                        className="py-1"
                    />
                    <p className="text-[10px] text-muted-foreground">{tTaste(`${key}Desc`)}</p>
                </div>
            ))}
        </div>
    );
}
