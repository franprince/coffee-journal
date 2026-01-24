'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { Recipe } from '@/lib/types';
import { METHOD_LABELS, GRIND_SIZE_LABELS } from '@/lib/types';
import { MethodIcon } from './method-icons';
import { RecipeExport } from './recipe-export';
import { Clock, Droplets, Scale, Coffee, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { DeleteConfirmDialog } from './delete-confirm-dialog';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect?: (recipe: Recipe) => void;
  onDelete?: (id: string) => void;
}

export function RecipeCard({ recipe, onSelect, onDelete }: RecipeCardProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const ratio = recipe.coffeeWeight > 0
    ? (recipe.totalWaterWeight / recipe.coffeeWeight).toFixed(1)
    : '0';

  const grindLabel = GRIND_SIZE_LABELS[Math.floor(recipe.grindSize / (100 / (GRIND_SIZE_LABELS.length - 1)))];

  const totalTime = recipe.pours && recipe.pours.length > 0
    ? recipe.pours[recipe.pours.length - 1].time
    : '0:00';

  // Calculate cumulative water for visualization
  let cumulativeWater = 0;
  const poursWithCumulative = (recipe.pours || []).map((pour, index) => {
    cumulativeWater += pour.waterAmount || 0;
    return { ...pour, cumulativeWater, isBloom: index === 0 || pour.notes?.toLowerCase().includes('bloom') };
  });

  return (
    <div className="relative group">
      <Link href={`/recipe/${recipe.id}`}>
        <div
          className="glass-card subtle-glow rounded-3xl p-0 transition-all duration-300 group relative hover:shadow-2xl cursor-pointer border border-white/5 active:scale-95 overflow-hidden"
        >
          {recipe.coffeeImageUrl && (
            <div className="w-full aspect-[2/1] border-b border-border/50">
              <img src={recipe.coffeeImageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-5">
            {/* Header - prominent */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 rounded-2xl bg-coffee-espresso/10 text-primary shadow-sm group-hover:shadow-md transition-shadow group-hover:bg-primary/20">
                  <MethodIcon method={recipe.method} className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-display text-lg font-bold text-coffee-espresso leading-tight">
                    {recipe.name}
                  </h3>
                  <p className="text-xs text-muted-foreground flex items-center gap-1 opacity-80 mt-0.5">
                    <Coffee className="w-3 h-3" />
                    {recipe.method}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <div className="font-mono text-lg font-bold text-coffee-espresso">1:{ratio}</div>
                <span className="text-[10px] text-muted-foreground">ratio</span>
              </div>
            </div>

            {/* Stats Row - compact */}
            <div className="flex items-center gap-4 mb-4 text-xs font-medium">
              <div className="flex items-center gap-1.5">
                <Scale className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono">{recipe.coffeeWeight}g</span>
              </div>
              <div className="flex items-center gap-1.5 text-coffee-water">
                <Droplets className="w-3.5 h-3.5" />
                <span className="font-mono">{recipe.totalWaterWeight}g</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="font-mono">{totalTime}</span>
              </div>
              <div className="ml-auto text-muted-foreground tracking-tight">
                {grindLabel}
              </div>
            </div>

            {/* Pour Timeline - Compact */}
            <div className="pt-3 border-t border-border/50">
              <div className="flex items-center justify-between mb-2 px-0.5">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest opacity-70">Schedule</span>
                <span className="text-[10px] text-muted-foreground opacity-70">{poursWithCumulative.length} steps</span>
              </div>

              {poursWithCumulative.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-3">
                  No pours added yet
                </div>
              ) : (
                <div className="relative">
                  {/* Vertical timeline line */}
                  <div className="absolute left-[7px] top-[25px] bottom-2 w-0.5 bg-border" />

                  <div className="space-y-1">
                    {poursWithCumulative.map((pour, index) => (
                      <div key={pour.id} className="flex items-center gap-2 relative">
                        {/* Timeline dot */}
                        <div className={`relative z-10 w-4 h-4 rounded-full flex-shrink-0 ${pour.isBloom ? 'bg-accent shadow-[0_0_10px_oklch(0.65_0.18_55_/_0.5)] border border-accent/20' : 'bg-coffee-espresso'}`} />

                        {/* Pour info - compact row */}
                        <div className={`flex-1 flex items-center gap-2 py-1.5 px-2 rounded transition-all ${pour.isBloom ? 'bg-gradient-to-r from-accent/10 to-transparent' : ''}`}>
                          <span className="font-mono text-xs font-medium text-foreground w-10">{pour.time}</span>
                          {pour.isBloom && (
                            <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-coffee-bloom/20 text-coffee-bloom tracking-wide uppercase shadow-[0_0_10px_oklch(0.65_0.18_55_/_0.2)]">
                              Bloom
                            </span>
                          )}
                          {pour.notes && !pour.isBloom && (
                            <span className="text-xs text-muted-foreground truncate max-w-20">{pour.notes}</span>
                          )}
                          <div className="ml-auto flex items-center gap-1.5">
                            <span className="font-mono text-xs text-coffee-water font-medium">+{pour.waterAmount}g</span>
                            <span className="text-[10px] text-muted-foreground">({Math.round((pour.cumulativeWater / recipe.totalWaterWeight) * 100)}%)</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Link>

      {/* Action Buttons */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 left-1/2 -translate-x-1/2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <RecipeExport recipe={recipe} />
        {onDelete && (
          <Button
            size="icon"
            variant="secondary"
            className="h-9 w-9 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-white hover:bg-destructive shadow-xl transition-all"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setShowDeleteConfirm(true);
            }}
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        )}
      </div>

      <DeleteConfirmDialog
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={() => onDelete?.(recipe.id)}
        title="Delete Recipe?"
        description={`Are you sure you want to delete "${recipe.name}"? This will also remove any associated brew logs. This action cannot be undone.`}
      />
    </div>
  );
}
