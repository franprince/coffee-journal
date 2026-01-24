'use client';

import Link from 'next/link';

import type { Recipe } from '@/lib/types';
import { METHOD_LABELS, GRIND_SIZE_LABELS } from '@/lib/types';
import { MethodIcon } from './method-icons';
import { RecipeExport } from './recipe-export';
import { Clock, Droplets, Scale, Coffee } from 'lucide-react';

interface RecipeCardProps {
  recipe: Recipe;
  onSelect?: (recipe: Recipe) => void;
}

export function RecipeCard({ recipe, onSelect }: RecipeCardProps) {
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
          className="glass-card subtle-glow rounded-3xl p-5 transition-all duration-300 group relative hover:shadow-2xl cursor-pointer border border-white/5 active:scale-95"
        >
          {/* Header - compact */}
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-2.5">
              <div className="p-2.5 rounded-2xl bg-coffee-espresso/10 text-primary shadow-sm group-hover:shadow-md transition-shadow group-hover:bg-primary/20">
                <MethodIcon method={recipe.method} className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-serif text-base font-semibold text-coffee-espresso">
                  {recipe.name}
                </h3>
                <p className="text-xs text-muted-foreground flex items-center gap-1">
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
          <div className="flex items-center gap-3 mb-3 text-xs">
            <div className="flex items-center gap-1.5">
              <Scale className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono font-medium">{recipe.coffeeWeight}g</span>
            </div>
            <div className="flex items-center gap-1.5 text-coffee-water">
              <Droplets className="w-3.5 h-3.5" />
              <span className="font-mono font-medium">{recipe.totalWaterWeight}g</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-muted-foreground" />
              <span className="font-mono font-medium">{totalTime}</span>
            </div>
            <div className="ml-auto text-muted-foreground">
              {grindLabel}
            </div>
          </div>

          {/* Pour Timeline - Compact */}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pour Schedule</span>
              <span className="text-xs text-muted-foreground">{poursWithCumulative.length} pours</span>
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
      </Link>

      {/* Export Button */}
      <div
        onClick={(e) => e.stopPropagation()}
        className="absolute top-4 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity z-10"
      >
        <RecipeExport recipe={recipe} />
      </div>

      {/* Header - compact */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2.5 rounded-2xl bg-coffee-espresso/10 text-primary shadow-sm group-hover:shadow-md transition-shadow group-hover:bg-primary/20">
            <MethodIcon method={recipe.method} className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-base font-semibold text-coffee-espresso">
              {recipe.name}
            </h3>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
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
      <div className="flex items-center gap-3 mb-3 text-xs">
        <div className="flex items-center gap-1.5">
          <Scale className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono font-medium">{recipe.coffeeWeight}g</span>
        </div>
        <div className="flex items-center gap-1.5 text-coffee-water">
          <Droplets className="w-3.5 h-3.5" />
          <span className="font-mono font-medium">{recipe.totalWaterWeight}g</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5 text-muted-foreground" />
          <span className="font-mono font-medium">{totalTime}</span>
        </div>
        <div className="ml-auto text-muted-foreground">
          {grindLabel}
        </div>
      </div>

      {/* Pour Timeline - Compact */}
      <div className="pt-3 border-t border-border">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Pour Schedule</span>
          <span className="text-xs text-muted-foreground">{poursWithCumulative.length} pours</span>
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
  );
}
