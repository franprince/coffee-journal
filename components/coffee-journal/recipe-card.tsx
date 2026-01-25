'use client';

import { useState } from 'react';
import Link from 'next/link';

import type { Recipe } from '@/lib/types';
import { METHOD_LABELS, GRIND_SIZE_LABELS } from '@/lib/types';
import { MethodIcon } from './method-icons';
import { RecipeExport } from './recipe-export';
import { Clock, Droplets, Scale, Coffee, Trash2, Zap } from 'lucide-react';
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
          className="modern-card group relative cursor-pointer hover:shadow-lg active:scale-[0.98] overflow-hidden bg-card"
        >
          {recipe.coffeeImageUrl && (
            <div className="w-full aspect-[2/1] border-b border-border/20">
              {/* Clean Image - No Vintage Filter */}
              <img src={recipe.coffeeImageUrl} alt={recipe.name} className="w-full h-full object-cover" />
            </div>
          )}
          <div className="p-6">
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4 w-full">
                <div className="p-3 rounded-full bg-secondary text-primary border border-border/50 shrink-0 mt-1">
                  <MethodIcon method={recipe.method} className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs text-muted-foreground flex items-center gap-1 font-medium px-0 py-0.5 w-fit uppercase tracking-wider mb-1">
                    {METHOD_LABELS[recipe.method as keyof typeof METHOD_LABELS] || recipe.method}
                  </p>
                  <h3 className="font-bold text-xl text-foreground leading-tight group-hover:text-primary transition-colors pr-2">
                    {recipe.name}
                  </h3>
                </div>
              </div>
              {/* Ratio removed from here to allow title space */}
            </div>

            {/* Stats Row */}
            <div className="flex flex-wrap items-center gap-3 mb-5 text-sm">
              {/* Ratio Badge */}
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-primary/5 border border-primary/10 text-primary">
                <Zap className="w-3.5 h-3.5" />
                <span className="font-mono font-bold">1:{ratio}</span>
              </div>

              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary/30">
                <Scale className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono font-medium">{recipe.coffeeWeight}g</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary/30">
                <Droplets className="w-4 h-4 text-coffee-water" />
                <span className="font-mono font-medium">{recipe.totalWaterWeight}g</span>
              </div>
              <div className="flex items-center gap-1.5 p-2 rounded-lg bg-secondary/30">
                <Clock className="w-4 h-4 text-muted-foreground" />
                <span className="font-mono font-medium">{totalTime}</span>
              </div>
            </div>

            {/* Pour Timeline - Soft Dots */}
            <div className="pt-4 border-t border-border/30">
              <div className="flex items-center justify-between mb-3">
                <span className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Steps</span>
                <span className="text-[10px] text-muted-foreground">{poursWithCumulative.length} actions</span>
              </div>

              {poursWithCumulative.length === 0 ? (
                <div className="text-sm text-muted-foreground text-center py-2 italic">
                  No pours recorded
                </div>
              ) : (
                <div className="relative pl-2">
                  <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border/40" />
                  <div className="space-y-3">
                    {poursWithCumulative.map((pour, index) => (
                      <div key={pour.id} className="flex items-start gap-3 relative">
                        {/* Dot */}
                        <div className={`relative z-10 w-3.5 h-3.5 rounded-full flex-shrink-0 border-2 border-background shadow-sm ${pour.isBloom ? 'bg-accent' : 'bg-secondary-foreground'}`} />

                        {/* Info */}
                        <div className="flex-1 flex items-baseline gap-2 -mt-1">
                          <span className="font-mono text-xs font-bold w-10 text-foreground/80">{pour.time}</span>

                          <div className="flex-1 min-w-0">
                            {pour.isBloom && (
                              <span className="inline-block px-2 py-0.5 text-[10px] font-bold bg-accent/10 text-accent rounded-full mr-2">
                                Bloom
                              </span>
                            )}
                            {pour.notes && !pour.isBloom && (
                              <span className="text-xs text-muted-foreground truncate">{pour.notes}</span>
                            )}
                          </div>

                          <div className="flex items-center gap-1">
                            <span className="font-mono text-xs font-medium text-foreground/70">+{pour.waterAmount}g</span>
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
            className="h-9 w-9 rounded-full bg-background shadow-lg hover:bg-destructive hover:text-white transition-colors border border-border/10"
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
        description={`Are you sure you want to delete "${recipe.name}"?`}
      />
    </div>
  );
}
