'use client';

import { useTranslations } from 'next-intl';

import type { Pour } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Droplets, Thermometer } from 'lucide-react';

interface PourTimelineProps {
  pours: Pour[];
  totalWater?: number;
  compact?: boolean;
}

export function PourTimeline({ pours, totalWater, compact = false }: PourTimelineProps) {
  const t = useTranslations('PourTimeline');

  if (pours.length === 0) {
    return (
      <div className="text-sm text-muted-foreground text-center py-4">
        {t('noPours')}
      </div>
    );
  }

  const isBloom = (pour: Pour, index: number) =>
    index === 0 || pour.notes?.toLowerCase().includes('bloom');

  // Calculate cumulative water for visualization
  let cumulativeWater = 0;
  const poursWithCumulative = pours.map((pour) => {
    cumulativeWater += pour.waterAmount || 0;
    return { ...pour, cumulativeWater };
  });

  const maxWater = totalWater || cumulativeWater;

  if (compact) {
    return (
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {poursWithCumulative.map((pour, index) => {
          const bloom = isBloom(pour, index);
          const widthPercentage = maxWater > 0 ? ((pour.waterAmount || 0) / maxWater) * 100 : 0;

          return (
            <div
              key={pour.id}
              className={cn(
                'flex-shrink-0 h-9 rounded-lg flex items-center justify-center text-xs font-mono font-medium transition-all duration-200',
                bloom
                  ? 'bg-coffee-bloom/20 text-coffee-bloom border border-coffee-bloom/40'
                  : 'bg-coffee-water/15 text-coffee-water border border-coffee-water/30'
              )}
              style={{
                minWidth: '52px',
                width: `${Math.max(widthPercentage, 15)}%`,
                maxWidth: '120px'
              }}
              title={`${pour.time} - ${pour.waterAmount}g${pour.notes ? ` (${pour.notes})` : ''}`}
            >
              {pour.waterAmount}g
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
          {t('title')}
        </span>
        <span className="text-xs text-muted-foreground">
          {pours.length} {pours.length !== 1 ? t('pours') : t('pour')}
        </span>
      </div>

      {/* Timeline visualization */}
      <div className="relative">

        {/* Pour nodes */}
        <div className="space-y-4">
          {poursWithCumulative.map((pour, index) => {
            const bloom = isBloom(pour, index);
            const isLast = index === poursWithCumulative.length - 1;

            const isFirst = index === 0;

            return (
              <div
                key={pour.id}
                className="relative flex items-center gap-4 group"
              >
                {/* Connecting Lines */}
                {!isLast && (
                  <div className={cn(
                    "absolute left-4 w-0.5 -ml-[1px] bg-border -z-10",
                    isFirst ? "top-1/2 -bottom-4" : "top-0 -bottom-4"
                  )} />
                )}

                {isLast && !isFirst && (
                  <div className="absolute left-4 top-0 h-1/2 w-0.5 -ml-[1px] bg-border -z-10" />
                )}

                {/* Timeline node */}
                <div className={cn(
                  'relative z-10 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-200 shrink-0',
                  bloom
                    ? 'bg-coffee-bloom text-white'
                    : 'bg-coffee-espresso text-coffee-crema'
                )}>
                  {index + 1}
                </div>

                {/* Pour details */}
                <div className={cn(
                  'flex-1 rounded-xl p-4 transition-all duration-200 border',
                  bloom
                    ? 'bg-coffee-bloom/10 border-coffee-bloom/30'
                    : 'bg-muted/30 border-border/50 group-hover:bg-muted/50'
                )}>
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-foreground">
                        {pour.time}
                      </span>
                      {bloom && (
                        <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-coffee-bloom/20 text-coffee-bloom">
                          {t('bloom')}
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm text-coffee-water font-medium">
                        +{pour.waterAmount}g
                      </span>
                      <span className="font-mono text-xs text-muted-foreground">
                        → {pour.cumulativeWater}g
                      </span>
                    </div>
                  </div>

                  {/* Water bar */}
                  <div className="h-2.5 bg-background rounded-full overflow-hidden mb-2">
                    <div
                      className={cn(
                        'h-full rounded-full transition-all duration-500',
                        bloom ? 'bg-coffee-bloom' : 'bg-coffee-water'
                      )}
                      style={{ width: `${(pour.cumulativeWater / maxWater) * 100}%` }}
                    />
                  </div>

                  {/* Temperature and notes */}
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    {pour.temperature && (
                      <div className="flex items-center gap-1 text-coffee-bloom">
                        <Thermometer className="w-3.5 h-3.5" />
                        <span className="font-medium">{pour.temperature}°{pour.temperatureUnit || 'C'}</span>
                      </div>
                    )}
                    {pour.notes && !bloom && (
                      <div className="flex items-center gap-1">
                        <Droplets className="w-3.5 h-3.5" />
                        <span>{pour.notes}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
