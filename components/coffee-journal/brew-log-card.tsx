'use client';

import type { BrewLog } from '@/lib/types';
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
    <div className="modern-card p-5 hover:shadow-lg transition-all relative group bg-card border-none ring-1 ring-border/20">
      {/* Tweak Indicator */}
      {hasTweaks && (
        <div className="absolute top-4 right-4 text-accent bg-accent/10 p-1 rounded-full" title="Recipe Modified">
          <SlidersHorizontal className="w-3.5 h-3.5" />
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4 pr-6">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-xl bg-secondary text-primary">
            <MethodIcon method={log.method} className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-foreground">{log.recipeName}</h4>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
              <Calendar className="w-3 h-3" />
              <span className="font-mono">{formattedDate}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Star rating - Prominent */}
      <div className="flex justify-center mb-4">
        <div className="flex items-center gap-1 bg-secondary/30 px-3 py-1.5 rounded-full">
          {[1, 2, 3, 4, 5].map((star) => (
            <Star
              key={star}
              className={cn(
                'w-4 h-4',
                star <= log.rating
                  ? 'fill-accent text-accent'
                  : 'text-border'
              )}
            />
          ))}
        </div>
      </div>

      {/* Radar chart - Softer colors */}
      <div className="flex items-center justify-center py-2 mb-4">
        <div className="relative w-24 h-24">
          <svg viewBox="0 0 100 100" className="w-full h-full">
            {/* Grid circles - very soft */}
            {[25, 50, 75, 100].map((r) => (
              <circle
                key={r}
                cx="50"
                cy="50"
                r={r * 0.4}
                fill="none"
                stroke="currentColor"
                strokeWidth="0.5"
                className="text-border/40"
              />
            ))}
            {/* Taste polygon - Soft Accent */}
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
              strokeWidth="2"
              className="text-accent"
            />
          </svg>
          {/* Labels */}
          <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[8px] font-bold text-muted-foreground uppercase">Acid</span>
          <span className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-[8px] font-bold text-muted-foreground uppercase">Sweet</span>
          <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-[8px] font-bold text-muted-foreground uppercase">Body</span>
          <span className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 text-[8px] font-bold text-muted-foreground uppercase">Bitter</span>
        </div>
      </div>

      {/* Taste values */}
      <div className="grid grid-cols-4 gap-2 mb-0 text-center">
        {tasteItems.map(({ key, label, value }) => (
          <div key={key} className="bg-secondary/20 rounded-lg py-1.5">
            <div className="text-[9px] text-muted-foreground uppercase font-bold mb-0.5">{label}</div>
            <div className="text-xs font-mono font-bold text-foreground">{value}</div>
          </div>
        ))}
      </div>

      {/* Notes */}
      {log.notes && (
        <div className="mt-4 pt-3 border-t border-border/40">
          <p className="text-xs text-muted-foreground italic line-clamp-2">
            &ldquo;{log.notes}&rdquo;
          </p>
        </div>
      )}
    </div>
  );
}
