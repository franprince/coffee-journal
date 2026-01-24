'use client';

import type { BrewLog } from '@/lib/types';
import { METHOD_LABELS } from '@/lib/types';
import { MethodIcon } from './method-icons';
import { Star, Calendar, Zap, Candy, Circle, AlertTriangle, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BrewLogCardProps {
  log: BrewLog;
}

export function BrewLogCard({ log }: BrewLogCardProps) {
  const formattedDate = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(log.date);

  const hasTweaks = log.coffeeWeight || log.totalWaterWeight || log.grindSize || log.temperature || log.pours;

  const tasteItems = [
    { key: 'acidity', label: 'Acidity', icon: Zap, value: log.tasteProfile.acidity },
    { key: 'sweetness', label: 'Sweet', icon: Candy, value: log.tasteProfile.sweetness },
    { key: 'body', label: 'Body', icon: Circle, value: log.tasteProfile.body },
    { key: 'bitterness', label: 'Bitter', icon: AlertTriangle, value: log.tasteProfile.bitterness },
  ];

  return (
    <div className="glass-card rounded-lg p-3 hover:shadow-md transition-all border border-border relative group">
      {/* Tweak Indicator */}
      {hasTweaks && (
        <div className="absolute top-2 right-2 text-accent" title="Recipe Modified">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Header - compact */}
      <div className="flex items-start justify-between mb-2 pr-4">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-coffee-espresso text-coffee-crema">
            <MethodIcon method={log.method} className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-medium text-coffee-espresso">{log.recipeName}</h4>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              {formattedDate}
            </div>
          </div>
        </div>

        {/* Star rating */}
        <div className="flex items-center gap-0.5">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-3.5 h-3.5',
                star <= log.rating
                  ? 'fill-coffee-bloom text-coffee-bloom'
                  : 'text-muted-foreground/30'
              )}
            />
          ))}
        </div>
      </div>

      {/* Radar chart */}
      <div className="flex items-center justify-center py-3 mb-2">
        <div className="relative w-24 h-24">
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
                ${50 + (log.tasteProfile.acidity / 100) * 40 * Math.cos(-90 * Math.PI / 180)},${50 + (log.tasteProfile.acidity / 100) * 40 * Math.sin(-90 * Math.PI / 180)}
                ${50 + (log.tasteProfile.sweetness / 100) * 40 * Math.cos(0 * Math.PI / 180)},${50 + (log.tasteProfile.sweetness / 100) * 40 * Math.sin(0 * Math.PI / 180)}
                ${50 + (log.tasteProfile.body / 100) * 40 * Math.cos(90 * Math.PI / 180)},${50 + (log.tasteProfile.body / 100) * 40 * Math.sin(90 * Math.PI / 180)}
                ${50 + (log.tasteProfile.bitterness / 100) * 40 * Math.cos(180 * Math.PI / 180)},${50 + (log.tasteProfile.bitterness / 100) * 40 * Math.sin(180 * Math.PI / 180)}
              `}
              fill="currentColor"
              fillOpacity="0.2"
              stroke="currentColor"
              strokeWidth="1.5"
              className="text-coffee-bloom"
            />
          </svg>
          {/* Compact labels */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1 text-[9px] text-muted-foreground">
            Acid
          </span>
          <span className="absolute right-0 top-1/2 translate-x-1 -translate-y-1/2 text-[9px] text-muted-foreground">
            Sweet
          </span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1 text-[9px] text-muted-foreground">
            Body
          </span>
          <span className="absolute left-0 top-1/2 -translate-x-1 -translate-y-1/2 text-[9px] text-muted-foreground">
            Bitter
          </span>
        </div>
      </div>

      {/* Compact taste values */}
      <div className="grid grid-cols-4 gap-1 mb-2 text-center">
        {tasteItems.map(({ key, label, value }) => (
          <div key={key}>
            <div className="text-[10px] text-muted-foreground">{label}</div>
            <div className="text-xs font-mono font-medium text-foreground">{value}%</div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {log.notes && (
        <div className="pt-2 border-t border-border">
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            &ldquo;{log.notes}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
