'use client';

import { useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Scale, Droplets, Hash, Thermometer, ChevronDown } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Pour } from '@/lib/types';
import { useState } from 'react';
import { useSettings } from '@/lib/hooks/use-settings';
import { getGrindLabel, micronsToClicks } from '@/lib/grinders';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface TweaksSectionProps {
    coffeeWeight: number;
    setCoffeeWeight: (val: number) => void;
    totalWaterWeight: number;
    setTotalWaterWeight: (val: number) => void;
    grindSize: number;
    setGrindSize: (val: number) => void;
    temperature: number;
    setTemperature: (val: number) => void;
    pours: Pour[];
    setPours: (pours: Pour[]) => void;
    showTweaks: boolean;
    onToggleTweaks: () => void;
}

export function TweaksSection({
    coffeeWeight,
    setCoffeeWeight,
    totalWaterWeight,
    setTotalWaterWeight,
    grindSize,
    setGrindSize,
    temperature,
    setTemperature,
    pours,
    setPours,
    showTweaks,
    onToggleTweaks
}: TweaksSectionProps) {
    const t = useTranslations('BrewLogForm');
    const tGrind = useTranslations('GrindSizes');
    const { settings } = useSettings();

    const label = getGrindLabel(grindSize);

    return (
        <div className="space-y-3">
            <button
                type="button"
                onClick={onToggleTweaks}
                className="flex items-center justify-center gap-2 text-xs text-primary font-medium hover:underline mx-auto w-full py-1"
            >
                {showTweaks ? t('hideTweaks') : t('adjustTweaks')}
                <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showTweaks && "rotate-180")} />
            </button>

            {showTweaks && (
                <div className="grid grid-cols-2 gap-3 bg-secondary/30 p-4 rounded-xl border border-border/50 animate-in slide-in-from-top-2">
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Scale className="w-3.5 h-3.5" /> {t('tweaks.coffee')}
                        </Label>
                        <Input
                            type="number"
                            value={coffeeWeight}
                            onChange={(e) => setCoffeeWeight(Number(e.target.value))}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Droplets className="w-3.5 h-3.5" /> {t('tweaks.water')}
                        </Label>
                        <Input
                            type="number"
                            value={totalWaterWeight}
                            onChange={(e) => setTotalWaterWeight(Number(e.target.value))}
                            className="h-8 text-sm"
                        />
                    </div>
                    <div className="space-y-1.5">
                        <div className="flex items-center justify-between">
                            <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                                <Hash className="w-3.5 h-3.5" /> {t('tweaks.grind')}
                            </Label>
                            <span className="text-[10px] font-bold text-primary">
                                <Tooltip>
                                    <TooltipTrigger asChild>
                                        <span className="cursor-help decoration-dotted underline-offset-4 hover:underline">
                                            {tGrind(label)}
                                        </span>
                                    </TooltipTrigger>
                                    <TooltipContent>
                                        <p>{grindSize}µm</p>
                                    </TooltipContent>
                                </Tooltip>
                            </span>
                        </div>
                        <Input
                            type="number"
                            value={grindSize}
                            onChange={(e) => setGrindSize(Number(e.target.value))}
                            className="h-8 text-sm"
                        />
                        {settings?.preferredGrinder && (
                            <p className="text-[10px] text-muted-foreground font-mono mt-0.5">
                                ~{micronsToClicks(grindSize, settings.preferredGrinder)}
                            </p>
                        )}
                    </div>
                    <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                            <Thermometer className="w-3.5 h-3.5" /> {t('tweaks.temp')}
                        </Label>
                        <Input
                            type="number"
                            value={temperature}
                            onChange={(e) => setTemperature(Number(e.target.value))}
                            className="h-8 text-sm"
                        />
                    </div>
                </div>
            )}

            {/* Edit Steps Section */}
            {showTweaks && (
                <div className="space-y-3 mt-4 border-t border-border pt-3">
                    <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        {t('tweaks.overrides')}
                    </Label>
                    <div className="space-y-3">
                        {pours.map((pour, index) => (
                            <div key={pour.id} className="grid grid-cols-[60px_60px_1fr] gap-2 items-center">
                                <Input
                                    value={pour.time}
                                    onChange={(e) => {
                                        const newPours = [...pours];
                                        newPours[index] = { ...pour, time: e.target.value };
                                        setPours(newPours);
                                    }}
                                    className="h-8 text-xs font-mono px-2 text-center"
                                    placeholder="mm:ss"
                                />
                                <Input
                                    type="number"
                                    value={pour.waterAmount}
                                    onChange={(e) => {
                                        const newPours = [...pours];
                                        newPours[index] = { ...pour, waterAmount: Number(e.target.value) };
                                        setPours(newPours);
                                    }}
                                    className="h-8 text-xs font-mono px-2 text-center"
                                    placeholder="g"
                                />
                                <Input
                                    value={pour.notes || ''}
                                    onChange={(e) => {
                                        const newPours = [...pours];
                                        newPours[index] = { ...pour, notes: e.target.value };
                                        setPours(newPours);
                                    }}
                                    className="h-8 text-xs px-2"
                                    placeholder="Notes..."
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
