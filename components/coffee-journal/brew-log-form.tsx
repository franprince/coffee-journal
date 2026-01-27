'use client';
import { useTranslations } from 'next-intl';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LogService } from '@/lib/db-client';
import type { BrewLog, Recipe, TasteProfile, Coffee } from '@/lib/types';
import { Star, Zap, Candy, Circle, AlertTriangle, Save, ChevronDown, Scale, Droplets, Thermometer, Hash, Bean, Camera, X } from 'lucide-react';
import { CoffeeLoader } from '@/components/ui/coffee-loader';
import { cn } from '@/lib/utils';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { AddCoffeeForm } from './add-coffee-form';

import { ImageCropper } from '@/components/ui/image-cropper';

interface BrewLogFormProps {
  recipe: Recipe;
  coffees: Coffee[];
  onAddCoffee: (coffee: Coffee) => void;
  onSave: (log: BrewLog) => void;
  onSaveAsNewRecipe?: (log: BrewLog, newName: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
}

const TASTE_DIMENSIONS = [
  { key: 'acidity' as const, label: 'Acidity', icon: Zap, description: 'Bright, tangy, vibrant' },
  { key: 'sweetness' as const, label: 'Sweetness', icon: Candy, description: 'Honey, fruit, caramel' },
  { key: 'body' as const, label: 'Body', icon: Circle, description: 'Weight, texture, mouthfeel' },
  { key: 'bitterness' as const, label: 'Bitterness', icon: AlertTriangle, description: 'Dark, roasty, intense' },
];

export function BrewLogForm({ recipe, coffees, onAddCoffee, onSave, onSaveAsNewRecipe, onCancel, isLoading }: BrewLogFormProps) {
  const t = useTranslations('BrewLogForm');
  const tTaste = useTranslations('Taste');
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
  const [isAddCoffeeOpen, setIsAddCoffeeOpen] = useState(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  // Cropper State
  const [cropperOpen, setCropperOpen] = useState(false);
  const [tempImageSrc, setTempImageSrc] = useState<string | null>(null);
  const [originalFileName, setOriginalFileName] = useState<string>('image.jpg');

  // New Recipe State
  const [showSaveAsNew, setShowSaveAsNew] = useState(false);
  const [newRecipeName, setNewRecipeName] = useState(`${recipe.name} (Variant)`);

  const hasChanges =
    coffeeWeight !== recipe.coffeeWeight ||
    totalWaterWeight !== recipe.totalWaterWeight ||
    grindSize !== recipe.grindSize ||
    temperature !== (recipe.pours?.[0]?.temperature || 93);


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
      coffeeId: selectedCoffeeId || undefined,
      coffeeName: coffees.find(c => c.id === selectedCoffeeId)?.name,
      notes: notes || undefined,
      imageUrls,
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
        <h3 className="font-display text-base font-semibold text-foreground">{t('title')}</h3>
        <p className="text-xs text-muted-foreground mt-0.5 mb-3">
          {t('subtitle', { name: recipe.name })}
        </p>

        {/* Coffee Selector */}
        <div className="max-w-[240px] mx-auto flex items-center gap-2">
          <Select value={selectedCoffeeId} onValueChange={setSelectedCoffeeId}>
            <SelectTrigger className="h-8 text-xs bg-secondary/20 border-border/50 flex-1">
              <SelectValue placeholder={t('selectCoffee')} />
            </SelectTrigger>
            <SelectContent className="glass-card">
              {coffees.map(c => (
                <SelectItem key={c.id} value={c.id} className="text-xs">
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Dialog open={isAddCoffeeOpen} onOpenChange={setIsAddCoffeeOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                size="icon"
                variant="outline"
                className="h-8 w-8 shrink-0 bg-secondary/20 border-border/50 hover:bg-secondary/40"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </DialogTrigger>
            <DialogContent
              className="glass-card border-border sm:max-w-[425px]"
              onInteractOutside={(e) => e.preventDefault()}
            >
              <DialogHeader>
                <DialogTitle className="sr-only">{t('addCoffee')}</DialogTitle>
              </DialogHeader>
              <AddCoffeeForm
                onSubmit={async (coffee) => {
                  onAddCoffee(coffee);
                  setSelectedCoffeeId(coffee.id);
                  setIsAddCoffeeOpen(false);
                }}
                defaultName={`Coffee Bean #${coffees.length + 1}`}
                onCancel={() => setIsAddCoffeeOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Recipe Tweaks Section */}
      <div className="space-y-3">
        <button
          type="button"
          onClick={() => setShowTweaks(!showTweaks)}
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
              <Label className="text-xs text-muted-foreground flex items-center gap-1.5">
                <Hash className="w-3.5 h-3.5" /> {t('tweaks.grind')}
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

      {/* Star Rating */}
      <div className="space-y-2">
        <Label className="text-foreground text-center block text-sm">{t('rating')}</Label>
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
          {rating && t(`ratings.${rating}`)}
        </p>
      </div>

      {/* Taste Profile Sliders */}
      <div className="space-y-3">
        <Label className="text-foreground text-sm">{t('tasteProfile')}</Label>

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
              onValueChange={(val) => updateTaste(key, val)}
              max={100}
              step={5}
              className="py-1"
            />
            <p className="text-[10px] text-muted-foreground">{tTaste(`${key}Desc`)}</p>
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
            {tTaste('acidity')}
          </span>
          <span className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 text-[10px] text-muted-foreground">
            {tTaste('sweetness')}
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-[10px] text-muted-foreground">
            {tTaste('body')}
          </span>
          <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 text-[10px] text-muted-foreground">
            {tTaste('bitterness')}
          </span>
        </div>
      </div>

      {/* Notes */}
      <div className="space-y-1.5">
        <Label htmlFor="notes" className="text-foreground text-sm">
          {t('notes')} <span className="text-muted-foreground text-xs">{t('optional')}</span>
        </Label>
        <Textarea
          id="notes"
          placeholder={t('notesPlaceholder')}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          className="bg-background border-border min-h-[80px] resize-none text-sm"
        />
      </div>

      {/* Image Upload */}
      <div className="space-y-2">
        <Label className="text-foreground text-sm flex items-center gap-1.5">
          <span className="flex items-center gap-1.5">
            <Camera className="w-3.5 h-3.5" />
            {t('photos')}
          </span>
          <span className="text-muted-foreground text-xs">{t('optional')}</span>
        </Label>

        <div className="grid grid-cols-4 gap-2">
          {imageUrls.map((url, index) => (
            <div key={index} className="relative aspect-square rounded-md overflow-hidden border border-border group">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={url} alt={`Brew photo ${index + 1}`} className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => setImageUrls(prev => prev.filter((_, i) => i !== index))}
                className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          {imageUrls.length < 3 && (
            <label className="flex flex-col items-center justify-center aspect-square rounded-md border border-dashed border-border bg-secondary/20 hover:bg-secondary/40 cursor-pointer transition-colors relative">
              <input
                type="file"
                accept="image/*"
                className="hidden"
                onChange={async (e) => {
                  const file = e.target.files?.[0];
                  if (!file) return;
                  if (file.size > 5 * 1024 * 1024) {
                    alert("File too large (max 5MB)");
                    return;
                  }

                  // Start Cropping Flow
                  setOriginalFileName(file.name);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setTempImageSrc(reader.result as string);
                    setCropperOpen(true);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = ''; // Reset input
                }}
                disabled={isUploading}
              />
              {isUploading ? (
                <div className="animate-spin rounded-full h-4 w-4 border-2 border-primary border-t-transparent" />
              ) : (
                <Plus className="w-5 h-5 text-muted-foreground" />
              )}
            </label>
          )}
        </div>

        <ImageCropper
          imageSrc={tempImageSrc}
          open={cropperOpen}
          onOpenChange={(open) => {
            if (!open) {
              setCropperOpen(false);
              setTempImageSrc(null);
            }
          }}
          onCropComplete={async (croppedBlob) => {
            setIsUploading(true);
            setCropperOpen(false);
            setTempImageSrc(null);

            try {
              const file = new File([croppedBlob], originalFileName, { type: 'image/jpeg' });
              const url = await LogService.uploadLogImage(file, originalFileName);
              setImageUrls(prev => [...prev, url]);
            } catch (error) {
              console.error("Upload failed", error);
              alert("Upload failed. Please try again.");
            } finally {
              setIsUploading(false);
            }
          }}
          aspect={1} // 1:1 for brew logs looks better in grid
        />
      </div>

      {/* Actions */}
      <div className="flex flex-col gap-3 pt-2">
        {hasChanges && onSaveAsNewRecipe && (
          <div className="bg-accent/10 p-3 rounded-lg border border-accent/20 animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-center gap-2 text-xs font-semibold text-accent-foreground mb-2">
              <AlertTriangle className="w-3.5 h-3.5" />
              Changes Detected
            </div>
            <ul className="text-[10px] text-muted-foreground space-y-1 mb-3 list-disc pl-4">
              {coffeeWeight !== recipe.coffeeWeight && <li>Coffee: {recipe.coffeeWeight}g → {coffeeWeight}g</li>}
              {totalWaterWeight !== recipe.totalWaterWeight && <li>Water: {recipe.totalWaterWeight}g → {totalWaterWeight}g</li>}
              {grindSize !== recipe.grindSize && <li>Grind: {recipe.grindSize}µm → {grindSize}µm</li>}
              {temperature !== (recipe.pours?.[0]?.temperature || 93) && <li>Temp: {recipe.pours?.[0]?.temperature || 93}°C → {temperature}°C</li>}
            </ul>

            {showSaveAsNew ? (
              <div className="space-y-2">
                <Input
                  value={newRecipeName}
                  onChange={(e) => setNewRecipeName(e.target.value)}
                  placeholder="New Recipe Name"
                  className="h-8 text-sm bg-background/50"
                />
                <div className="flex gap-2">
                  <Button
                    type="button"
                    onClick={() => setShowSaveAsNew(false)}
                    variant="ghost"
                    size="sm"
                    className="flex-1 h-8"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={(e) => {
                      e.preventDefault();
                      const log = {
                        id: crypto.randomUUID(),
                        recipeId: recipe.id,
                        recipeName: recipe.name,
                        method: recipe.method,
                        date: new Date(),
                        tasteProfile,
                        rating,
                        coffeeId: selectedCoffeeId || undefined,
                        coffeeName: coffees.find(c => c.id === selectedCoffeeId)?.name,
                        notes: notes || undefined,
                        imageUrls,
                        coffeeWeight,
                        totalWaterWeight,
                        grindSize,
                        temperature,
                        pours
                      };
                      onSaveAsNewRecipe(log, newRecipeName);
                    }}
                    disabled={!newRecipeName || isLoading}
                    size="sm"
                    className="flex-1 h-8 bg-accent text-accent-foreground hover:bg-accent/90"
                  >
                    <Plus className="w-3.5 h-3.5 mr-1.5" />
                    Save as New Recipe
                  </Button>
                </div>
              </div>
            ) : (
              <Button
                type="button"
                onClick={() => setShowSaveAsNew(true)}
                variant="ghost"
                className="w-full h-8 text-xs text-accent-foreground hover:bg-accent/20 hover:text-accent-foreground"
              >
                Save as New Recipe?
              </Button>
            )}
          </div>
        )}

        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            className="flex-1 h-9 text-sm bg-transparent"
          >
            {t('cancel')}
          </Button>
          <Button
            type="submit"
            disabled={isLoading}
            className="flex-1 h-9 text-sm bg-coffee-espresso hover:bg-coffee-espresso/90 text-coffee-crema"
          >
            {isLoading ? (
              <CoffeeLoader className="w-3.5 h-3.5 mr-1.5" />
            ) : (
              <Save className="w-3.5 h-3.5 mr-1.5" />
            )}
            {t('save')}
          </Button>
        </div>
      </div>
    </form >
  );
}
