'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import type { BrewLog, Recipe, TasteProfile, Coffee } from '@/lib/types';
import { Star, Zap, Candy, Circle, AlertTriangle, Save, ChevronDown, Scale, Droplets, Thermometer, Hash, Bean } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface BrewLogFormProps {
  recipe: Recipe;
  coffees: Coffee[];
  onSave: (log: BrewLog) => void;
  onCancel: () => void;
}

const TASTE_DIMENSIONS = [
  { key: 'acidity' as const, label: 'Acidity', icon: Zap, description: 'Bright, tangy, vibrant' },
  { key: 'sweetness' as const, label: 'Sweetness', icon: Candy, description: 'Honey, fruit, caramel' },
  { key: 'body' as const, label: 'Body', icon: Circle, description: 'Weight, texture, mouthfeel' },
  { key: 'bitterness' as const, label: 'Bitterness', icon: AlertTriangle, description: 'Dark, roasty, intense' },
];

export function BrewLogForm({ recipe, coffees, onSave, onCancel }: BrewLogFormProps) {
  const [tasteProfile, setTasteProfile] = useState<TasteProfile>({
    acidity: 50,
    sweetness: 50,
    body: 50,
    bitterness: 30,
  });
  const [rating, setRating] = useState(4);
  const [notes, setNotes] = useState('');
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);

  // Recipe Tweaks State
  const [showTweaks, setShowTweaks] = useState(false);
  const [coffeeWeight, setCoffeeWeight] = useState(recipe.coffeeWeight);
  const [totalWaterWeight, setTotalWaterWeight] = useState(recipe.totalWaterWeight);
  const [grindSize, setGrindSize] = useState(recipe.grindSize);
  const [temperature, setTemperature] = useState(recipe.pours?.[0]?.temperature || 93);
  const [pours, setPours] = useState(recipe.pours || []);
  const [selectedCoffeeId, setSelectedCoffeeId] = useState<string>('');

  const updateTaste = (key: keyof TasteProfile, value: number[]) => {
    setTasteProfile(prev => ({ ...prev, [key]: value[0] }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const log: BrewLog = {
      id: crypto.randomUUID(),
      recipeId: recipe.id,
      recipeName: recipe.name,
      method: recipe.method,
      date: new Date(),
      tasteProfile,
      rating,
      coffeeId: selectedCoffeeId,
      coffeeName: coffees.find(c => c.id === selectedCoffeeId)?.name,
      notes: notes || undefined,
      // Save tweaks
      coffeeWeight,
      totalWaterWeight,
      grindSize,
      temperature,
      pours: showTweaks ? pours : undefined,
    };

    onSave(log);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Header */}
      <div className="text-center pb-3 border-b border-border">
        <h3 className="font-serif text-base font-semibold text-foreground">Log Your Brew</h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
          How was your {recipe.name}?
        </p>

        {/* Coffee Selector */}
        <div className="max-w-[200px] mx-auto">
          <Select value={selectedCoffeeId} onValueChange={setSelectedCoffeeId}>
            <SelectTrigger className="h-8 text-xs bg-secondary/20 border-border/50">
              <SelectValue placeholder="Select Coffee Bean..." />
            </SelectTrigger>
            <SelectContent>
              {coffees.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Recipe Tweaks Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowTweaks(!showTweaks)}
          className="flex items-center justify-center gap-2 text-xs text-primary font-medium hover:underline mx-auto w-full py-1"
        >
          {showTweaks ? 'Hide Recipe Parameters' : 'Adjust Recipe Parameters'}
          <ChevronDown className={cn("w-3.5 h-3.5 transition-transform", showTweaks && "rotate-180")} />
        </button>

        {showTweaks && (
          <div className="grid grid-cols-2 gap-3 bg-secondary/30 p-4 rounded-xl border border-border/50 animate-in slide-in-from-top-2">
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5" /> Coffee (g)
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
                <Droplets className="w-3.5 h-3.5" /> Water (g)
              </Label>
              <Input
                type="number"
                value={totalWaterWeight}
                onChange={(e) => setTotalWaterWeight(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> Grind
              </Label>
              <Input
                type="number"
                value={grindSize}
                onChange={(e) => setGrindSize(Number(e.target.value))}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Thermometer className="w-3.5 h-3.5" /> Temp (°C)
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
              Pour Schedule Overrides
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

      {/* Star Rating */}
      <div className="space-y-2">
        <Label className="text-foreground text-center block text-sm">Overall Rating</Label>
        <div className="flex items-center justify-center gap-1.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredStar(star)}
              onMouseLeave={() => setHoveredStar(null)}
              className="p-0.5 transition-transform focus:outline-none"
            >
              <Star
                className={cn(
                  'w-6 h-6 transition-colors',
                  (hoveredStar !== null ? star <= hoveredStar : star <= rating)
                    ? 'fill-coffee-bloom text-coffee-bloom'
                    : 'text-muted-foreground/30'
                )}
              />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-muted-foreground min-h-[1.25rem]">
          {rating === 1 && 'Needs work'}
          {rating === 2 && 'Below average'}
          {rating === 3 && 'Good'}
          {rating === 4 && 'Great!'}
          {rating === 5 && 'Perfect!'}
        </p>
      </div>

      {/* Taste Profile Sliders */}
      <div className="space-y-3">
        <Label className="text-foreground text-sm">Taste Profile</Label>

        {TASTE_DIMENSIONS.map(({ key, label, icon: Icon, description }) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5">
                <Icon className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="text-xs font-medium text-foreground">{label}</span>
              </div>
              <span className="text-xs text-muted-foreground font-mono">
                {tasteProfile[key]}%
              </span>
            </div>
            <Slider
              value={[tasteProfile[key]]}
              onValueChange={(val) => updateTaste(key, val)}
              max={100}
              step={5}
              className="py-1"
            />
            <p className="text-[10px] text-muted-foreground">{description}</p>
          </div>
        ))}
      </div>

      {/* Taste visualization */}
      <div className="flex items-center justify-center py-3">
        <div className="relative w-32 h-32">
          {/* Radar chart background */}
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid circles */}
            {[25, 50, 75, 100].map((r) => (
              <circle
                key={r}
                cx="50"
                cy="50"
                r={r * 0.4}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            ))}
            {/* Axes */}
            {[0, 90, 180, 270].map((angle) => (
              <line
                key={angle}
                x1="50"
                y1="50"
                x2={50 + 40 * Math.cos((angle - 90) * Math.PI / 180)}
                y2={50 + 40 * Math.sin((angle - 90) * Math.PI / 180)}
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border"
              />
            ))}
            {/* Taste polygon */}
            <polygon
              points={`
                ${50 + (tasteProfile.acidity / 100) * 40 * Math.cos(-90 * Math.PI / 180)},${50 + (tasteProfile.acidity / 100) * 40 * Math.sin(-90 * Math.PI / 180)}
                ${50 + (tasteProfile.sweetness / 100) * 40 * Math.cos(0 * Math.PI / 180)},${50 + (tasteProfile.sweetness / 100) * 40 * Math.sin(0 * Math.PI / 180)}
                ${50 + (tasteProfile.body / 100) * 40 * Math.cos(90 * Math.PI / 180)},${50 + (tasteProfile.body / 100) * 40 * Math.sin(90 * Math.PI / 180)}
                ${50 + (tasteProfile.bitterness / 100) * 40 * Math.cos(180 * Math.PI / 180)},${50 + (tasteProfile.bitterness / 100) * 40 * Math.sin(180 * Math.PI / 180)}
              `}
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="2"
              className="text-coffee-bloom"
            />
          </svg>
          {/* Labels */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[10px] text-muted-foreground">
            Acidity
          </span>
          <span className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 text-[10px] text-muted-foreground">
            Sweet
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-[10px] text-muted-foreground">
            Body
          </span>
          <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 text-[10px] text-muted-foreground">
            Bitter
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-foreground text-sm">
          Iteration Notes <span className="text-muted-foreground text-xs">(optional)</span>
        </Label>
        <Textarea
          id="notes"
          placeholder="What would you change next time? e.g., Grind finer, bloom longer..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-background border-border min-h-[80px] resize-none text-sm"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="flex-1 h-9 text-sm bg-transparent"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          className="flex-1 h-9 text-sm bg-coffee-espresso hover:bg-coffee-espresso/90 text-coffee-crema"
        >
          <Save className="w-3.5 h-3.5 mr-1.5" />
          Save Log
        </Button>
      </div>
    </form >
  );
}
