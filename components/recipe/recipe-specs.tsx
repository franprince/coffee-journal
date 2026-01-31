'use client';

import { useTranslations } from 'next-intl';
import { useSettings } from '@/lib/hooks/use-settings';
import { micronsToClicks, getGrindLabel } from '@/lib/grinders';
import { Scale, Droplets, Hash, Thermometer, Zap } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import type { Recipe } from '@/lib/types';

interface RecipeSpecsProps {
    recipe: Recipe;
}

export function RecipeSpecs({ recipe }: RecipeSpecsProps) {
    const t = useTranslations('RecipeDetail');
    const tGrind = useTranslations('GrindSizes');
    const { settings } = useSettings();

    const label = getGrindLabel(recipe.grindSize);

    return (
        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-10">
            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                    <Zap className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('ratio')}</span>
                </div>
                <span className="text-base md:text-xl font-bold text-foreground">1:{(recipe.totalWaterWeight / recipe.coffeeWeight).toFixed(1)}</span>
            </div>

            {/* Coffee */}
            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                    <Scale className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('coffee')}</span>
                </div>
                <span className="text-sm md:text-lg font-mono font-medium">{recipe.coffeeWeight}g</span>
            </div>

            {/* Water */}
            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                <div className="flex items-center justify-center gap-1 text-coffee-water mb-0.5">
                    <Droplets className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('water')}</span>
                </div>
                <span className="text-sm md:text-lg font-mono font-medium text-coffee-water">{recipe.totalWaterWeight}g</span>
            </div>

            {/* Grind */}
            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                    <Hash className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('grind')}</span>
                </div>
                <div className="flex flex-col items-center">
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <span className="text-sm md:text-lg font-medium leading-tight cursor-help decoration-dotted underline-offset-4 hover:underline">
                                {tGrind(label)}
                            </span>
                        </TooltipTrigger>
                        <TooltipContent>
                            <p>{recipe.grindSize}µm</p>
                        </TooltipContent>
                    </Tooltip>

                    {settings?.preferredGrinder && (
                        <span className="text-[10px] text-muted-foreground font-mono">
                            {micronsToClicks(recipe.grindSize, settings.preferredGrinder)}
                        </span>
                    )}
                </div>
            </div>

            {/* Temp */}
            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                    <Thermometer className="w-3 h-3 md:w-4 md:h-4" />
                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('temp')}</span>
                </div>
                <span className="text-sm md:text-lg font-medium">{recipe.pours?.[0]?.temperature || 93}°C</span>
            </div>
        </div>
    );
}
