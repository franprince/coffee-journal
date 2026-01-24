'use client';

import React from "react"

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { Pour } from '@/lib/types';
import { Plus, GripVertical, Trash2, Droplets } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PourScheduleProps {
  pours: Pour[];
  onPoursChange: (pours: Pour[]) => void;
  totalWaterTarget: number;
}

export function PourSchedule({ pours, onPoursChange, totalWaterTarget }: PourScheduleProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const totalWater = pours.reduce((sum, pour) => sum + (pour.waterAmount || 0), 0);
  const waterPercentage = totalWaterTarget > 0 ? (totalWater / totalWaterTarget) * 100 : 0;

  const addPour = () => {
    const newPour: Pour = {
      id: crypto.randomUUID(),
      time: '00:00',
      waterAmount: 0,
      temperatureUnit: 'C',
      notes: '',
    };
    onPoursChange([...pours, newPour]);
  };

  const updatePour = (index: number, field: keyof Pour, value: string | number) => {
    const updated = [...pours];
    updated[index] = { ...updated[index], [field]: value };
    onPoursChange(updated);
  };

  const removePour = (index: number) => {
    onPoursChange(pours.filter((_, i) => i !== index));
  };

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    if (draggedIndex === null || draggedIndex === index) return;

    const newPours = [...pours];
    const draggedItem = newPours[draggedIndex];
    newPours.splice(draggedIndex, 1);
    newPours.splice(index, 0, draggedItem);
    onPoursChange(newPours);
    setDraggedIndex(index);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const isBloom = (index: number) => index === 0 || pours[index]?.notes?.toLowerCase().includes('bloom');

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <Label className="text-foreground text-sm font-medium">Pour Schedule</Label>
        <div className="flex items-center gap-1.5 text-xs">
          <Droplets className="w-3.5 h-3.5 text-primary" />
          <span className={cn(
            'font-mono transition-colors',
            waterPercentage > 100 ? 'text-destructive' : 'text-foreground'
          )}>
            {totalWater}g
          </span>
          <span className="text-muted-foreground">/ {totalWaterTarget}g</span>
        </div>
      </div>

      {/* Water progress bar */}
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div 
          className={cn(
            'h-full transition-all duration-500 ease-out rounded-full',
            waterPercentage > 100 ? 'bg-destructive' : 'bg-primary'
          )}
          style={{ width: `${Math.min(waterPercentage, 100)}%` }}
        />
      </div>

      {/* Pours list */}
      <div className="space-y-2">
        {pours.map((pour, index) => (
          <div
            key={pour.id}
            draggable
            onDragStart={() => handleDragStart(index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={handleDragEnd}
            className={cn(
              'rounded-lg p-2.5 transition-all duration-200 border bg-card',
              draggedIndex === index && 'opacity-50 scale-95',
              isBloom(index) ? 'border-coffee-bloom/50 bg-coffee-bloom/5' : 'border-border'
            )}
          >
            <div className="flex items-center gap-2">
              {/* Drag handle */}
              <button 
                type="button"
                className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors"
              >
                <GripVertical className="w-3.5 h-3.5" />
              </button>

              {/* Pour number */}
              <div className={cn(
                'flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold',
                isBloom(index) 
                  ? 'bg-coffee-bloom text-white' 
                  : 'bg-primary text-primary-foreground'
              )}>
                {index + 1}
              </div>

              {/* Time */}
              <Input
                type="text"
                placeholder="00:00"
                value={pour.time}
                onChange={(e) => {
                  let val = e.target.value.replace(/[^\d:]/g, '');
                  if (val.length === 2 && !val.includes(':')) {
                    val = val + ':';
                  }
                  if (val.length <= 5) {
                    updatePour(index, 'time', val);
                  }
                }}
                className="h-7 w-16 bg-background border-border font-mono text-xs px-2"
              />

              {/* Water */}
              <Input
                type="number"
                placeholder="0"
                min={0}
                value={pour.waterAmount || ''}
                onChange={(e) => updatePour(index, 'waterAmount', Number(e.target.value))}
                className="h-7 w-14 bg-background border-border font-mono text-xs px-2"
              />
              <span className="text-xs text-muted-foreground">g</span>

              {/* Notes */}
              <Input
                type="text"
                placeholder="notes"
                value={pour.notes || ''}
                onChange={(e) => updatePour(index, 'notes', e.target.value)}
                className="h-7 flex-1 bg-background border-border text-xs px-2 min-w-0"
              />

              {/* Remove button */}
              <button
                type="button"
                onClick={() => removePour(index)}
                className="p-1 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Add pour button */}
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={addPour}
        className="w-full h-8 border-dashed border-border hover:border-primary/50 hover:bg-primary/5 text-xs bg-transparent"
      >
        <Plus className="w-3.5 h-3.5 mr-1.5" />
        Add Pour
      </Button>
    </div>
  );
}
