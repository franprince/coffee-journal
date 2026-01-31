import { useTranslations } from 'next-intl';

import React from "react"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { PourSchedule } from '@/components/shared';
import type { Recipe, Pour } from '@/lib/types';
import { METHOD_SUGGESTIONS, WATER_SUGGESTIONS } from '@/lib/types';
import { Save, Coffee } from 'lucide-react';
import { useSettings } from '@/lib/hooks/use-settings';
import { getGrindLabel, micronsToClicks } from '@/lib/grinders';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';

interface RecipeFormProps {
  onSave: (recipe: Recipe) => void;
  editRecipe?: Recipe;
  isLoading?: boolean;
}

export function RecipeForm({ onSave, editRecipe, isLoading }: RecipeFormProps) {
  const t = useTranslations('RecipeForm');
  const tCommon = useTranslations('Common');
  const { settings } = useSettings();
  const [name, setName] = useState(editRecipe?.name || '');
  const [method, setMethod] = useState(editRecipe?.method || 'V60');
  const [coffeeWeight, setCoffeeWeight] = useState(editRecipe?.coffeeWeight || 18);
  const [totalWaterWeight, setTotalWaterWeight] = useState(editRecipe?.totalWaterWeight || 300);
  const [grindSize, setGrindSize] = useState([editRecipe?.grindSize || 600]);
  const [waterType, setWaterType] = useState(editRecipe?.waterType || '');
  const [pours, setPours] = useState<Pour[]>(editRecipe?.pours || [
    {
      id: crypto.randomUUID(),
      time: '00:00',
      waterAmount: 50,
      temperature: 93,
      temperatureUnit: 'C',
      notes: 'bloom',
    },
    {
      id: crypto.randomUUID(),
      time: '00:45',
      waterAmount: 100,
      temperature: 93,
      temperatureUnit: 'C',
      notes: 'spiral pour',
    },
  ]);

  const ratio = coffeeWeight > 0 ? (totalWaterWeight / coffeeWeight).toFixed(1) : '0';


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const recipe: Recipe = {
      id: editRecipe?.id || crypto.randomUUID(),
      name: name || 'Untitled Recipe',
      method: method || 'V60',
      coffeeWeight,
      totalWaterWeight,
      grindSize: grindSize[0],
      waterType: waterType || undefined,
      pours: pours.map((p, idx) => ({ ...p, id: p.id || crypto.randomUUID() })),
      createdAt: editRecipe?.createdAt || new Date(),
    };

    onSave(recipe);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-2 pb-3 border-b border-border">
        <div className="p-1.5 rounded-lg bg-primary/10 text-primary">
          <Coffee className="w-4 h-4" />
        </div>
        <div>
          <h2 className="font-display text-lg font-semibold text-foreground">{editRecipe ? t('editTitle') : t('newTitle')}</h2>
        </div>
      </div>

      {/* Recipe Name & Method in row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs text-muted-foreground">{t('nameLabel')}</Label>
          <Input
            id="name"
            type="text"
            placeholder={t('namePlaceholder')}
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 bg-background/50 border-border text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{t('methodLabel')}</Label>
          <AutocompleteInput
            value={method}
            onValueChange={setMethod}
            suggestions={METHOD_SUGGESTIONS}
            placeholder={t('methodPlaceholder')}
            className="h-9 bg-background/50 border-border"
          />
        </div>
      </div>

      {/* Coffee, Water, Ratio in row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="coffee" className="text-xs text-muted-foreground">{t('coffeeLabel')}</Label>
          <Input
            id="coffee"
            type="number"
            min={1}
            max={100}
            value={coffeeWeight}
            onChange={(e) => setCoffeeWeight(Number(e.target.value))}
            className="h-9 bg-background/50 border-border font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="water" className="text-xs text-muted-foreground">{t('waterLabel')}</Label>
          <Input
            id="water"
            type="number"
            min={1}
            max={1000}
            value={totalWaterWeight}
            onChange={(e) => setTotalWaterWeight(Number(e.target.value))}
            className="h-9 bg-background/50 border-border font-mono"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{t('ratioLabel')}</Label>
          <div className="h-9 flex items-center justify-center rounded-md bg-secondary border border-border font-display font-bold text-primary">
            1:{ratio}
          </div>
        </div>
      </div>

      {/* Grind Size & Water Type in row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">{t('grindLabel')}</Label>
            <div className="flex flex-col items-end">
              <Tooltip>
                <TooltipTrigger asChild>
                  <span className="text-xs font-bold text-primary cursor-help decoration-dotted underline-offset-4 hover:underline">
                    {useTranslations('GrindSizes')(getGrindLabel(grindSize[0]))}
                  </span>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{grindSize[0]}µm</p>
                </TooltipContent>
              </Tooltip>
              {settings?.preferredGrinder && (
                <span className="text-[10px] text-muted-foreground font-mono">
                  {micronsToClicks(grindSize[0], settings.preferredGrinder)}
                </span>
              )}
            </div>
          </div>
          <Slider
            value={grindSize}
            onValueChange={setGrindSize}
            max={1400}
            step={10}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>0µm</span>
            <span>1400µm</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">{t('waterTypeLabel')}</Label>
          <AutocompleteInput
            value={waterType}
            onValueChange={setWaterType}
            suggestions={WATER_SUGGESTIONS}
            placeholder={t('waterTypePlaceholder')}
            className="h-9 bg-background/50 border-border"
          />
        </div>
      </div>

      {/* Pour Schedule */}
      <div className="pt-3 border-t border-border">
        <PourSchedule
          pours={pours}
          onPoursChange={setPours}
          totalWaterTarget={totalWaterWeight}
        />
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10"
      >
        {isLoading ? (
          <div className="w-4 h-4 mr-2 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />
        ) : (
          <Save className="w-4 h-4 mr-2" />
        )}
        {editRecipe ? t('update') : t('save')}
      </Button>
    </form>
  );
}
