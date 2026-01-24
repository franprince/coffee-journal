'use client';

import React from "react"
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { PourSchedule } from './pour-schedule';
import type { Recipe, Pour } from '@/lib/types';
import { METHOD_SUGGESTIONS, WATER_SUGGESTIONS, GRIND_SIZE_LABELS } from '@/lib/types';
import { Save, Coffee } from 'lucide-react';

interface RecipeFormProps {
  onSave: (recipe: Recipe) => void;
}

export function RecipeForm({ onSave }: RecipeFormProps) {
  const [name, setName] = useState('');
  const [method, setMethod] = useState('V60');
  const [coffeeWeight, setCoffeeWeight] = useState(18);
  const [totalWaterWeight, setTotalWaterWeight] = useState(300);
  const [grindSize, setGrindSize] = useState([50]);
  const [waterType, setWaterType] = useState('');
  const [pours, setPours] = useState<Pour[]>([
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
  const grindLabel = GRIND_SIZE_LABELS[Math.floor(grindSize[0] / (100 / (GRIND_SIZE_LABELS.length - 1)))];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const recipe: Recipe = {
      id: crypto.randomUUID(),
      name: name || 'Untitled Recipe',
      method: method || 'V60',
      coffeeWeight,
      totalWaterWeight,
      grindSize: grindSize[0],
      waterType: waterType || undefined,
      pours,
      createdAt: new Date(),
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
          <h2 className="font-serif text-lg font-semibold text-foreground">New Recipe</h2>
        </div>
      </div>

      {/* Recipe Name & Method in row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="name" className="text-xs text-muted-foreground">Recipe Name</Label>
          <Input
            id="name"
            type="text"
            placeholder="Morning V60"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9 bg-background/50 border-border text-foreground placeholder:text-muted-foreground/50"
          />
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Brew Method</Label>
          <AutocompleteInput
            value={method}
            onValueChange={setMethod}
            suggestions={METHOD_SUGGESTIONS}
            placeholder="V60, Chemex..."
            className="h-9 bg-background/50 border-border"
          />
        </div>
      </div>

      {/* Coffee, Water, Ratio in row */}
      <div className="grid grid-cols-3 gap-3">
        <div className="space-y-1.5">
          <Label htmlFor="coffee" className="text-xs text-muted-foreground">Coffee (g)</Label>
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
          <Label htmlFor="water" className="text-xs text-muted-foreground">Water (g)</Label>
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
          <Label className="text-xs text-muted-foreground">Ratio</Label>
          <div className="h-9 flex items-center justify-center rounded-md bg-secondary border border-border font-serif font-bold text-primary">
            1:{ratio}
          </div>
        </div>
      </div>

      {/* Grind Size & Water Type in row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label className="text-xs text-muted-foreground">Grind Size</Label>
            <span className="text-xs font-medium text-primary">{grindLabel}</span>
          </div>
          <Slider
            value={grindSize}
            onValueChange={setGrindSize}
            max={100}
            step={1}
            className="py-2"
          />
          <div className="flex justify-between text-[10px] text-muted-foreground">
            <span>Fine</span>
            <span>Coarse</span>
          </div>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground">Water Type (opt)</Label>
          <AutocompleteInput
            value={waterType}
            onValueChange={setWaterType}
            suggestions={WATER_SUGGESTIONS}
            placeholder="Filtered, Spring..."
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
        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium h-10"
      >
        <Save className="w-4 h-4 mr-2" />
        Save Recipe
      </Button>
    </form>
  );
}
