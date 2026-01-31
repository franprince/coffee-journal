'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { LogService } from '@/lib/db-client';
import type { User } from '@supabase/supabase-js';
import type { BrewLog, Recipe, TasteProfile, Coffee } from '@/lib/types';
import { Star, AlertTriangle, Save, Camera, X, Plus } from 'lucide-react';
import { CoffeeLoader } from '@/components/ui/coffee-loader';
import { cn } from '@/lib/utils';
import { AuthDialog } from '@/components/shared';
import { ImageCropper } from '@/components/ui/image-cropper';

// Extracted Components
import { CoffeeSelector } from './coffee-selector';
import { TasteSlider } from './taste-slider';
import { TweaksSection } from './tweaks-section';

interface BrewLogFormProps {
  recipe: Recipe;
  coffees: Coffee[];
  onAddCoffee: (coffee: Coffee) => void;
  onSave: (log: BrewLog) => void;
  onSaveAsNewRecipe?: (log: BrewLog, newName: string) => void;
  onCancel: () => void;
  isLoading?: boolean;
  user: User | null;
}

export function BrewLogForm({ recipe, coffees, onAddCoffee, onSave, onSaveAsNewRecipe, onCancel, isLoading, user }: BrewLogFormProps) {
  const t = useTranslations('BrewLogForm');
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

  // Image State
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
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

  const updateTaste = (key: keyof TasteProfile, value: number) => {
    setTasteProfile(prev => ({ ...prev, [key]: value }));
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
        <CoffeeSelector
          coffees={coffees}
          selectedCoffeeId={selectedCoffeeId}
          onSelectCoffee={setSelectedCoffeeId}
          onAddCoffee={onAddCoffee}
        />
      </div>

      {/* Tweaks Section */}
      <TweaksSection
        coffeeWeight={coffeeWeight}
        setCoffeeWeight={setCoffeeWeight}
        totalWaterWeight={totalWaterWeight}
        setTotalWaterWeight={setTotalWaterWeight}
        grindSize={grindSize}
        setGrindSize={setGrindSize}
        temperature={temperature}
        setTemperature={setTemperature}
        pours={pours}
        setPours={setPours}
        showTweaks={showTweaks}
        onToggleTweaks={() => setShowTweaks(!showTweaks)}
      />

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

      {/* Taste Profile */}
      <div className="space-y-3">
        <Label className="text-foreground text-sm">{t('tasteProfile')}</Label>
        <TasteSlider tasteProfile={tasteProfile} onChange={updateTaste} />
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
                className="absolute top-1 right-1 bg-black/50 text-white p-0.5 rounded-full opacity-100 md:opacity-0 group-hover:opacity-100 transition-opacity"
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
                  setOriginalFileName(file.name);
                  const reader = new FileReader();
                  reader.onloadend = () => {
                    setTempImageSrc(reader.result as string);
                    setCropperOpen(true);
                  };
                  reader.readAsDataURL(file);
                  e.target.value = '';
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
          aspect={1}
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
          {user ? (
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
          ) : (
            <AuthDialog />
          )}
        </div>
      </div>
    </form>
  );
}
