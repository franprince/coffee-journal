'use client';

import { useTranslations, useFormatter } from 'next-intl';
import Image from 'next/image';
import { useState } from 'react';
import type { BrewLog } from '@/lib/types';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Star,
    Calendar,
    Zap,
    Candy,
    Circle,
    AlertTriangle,
    Scale,
    Droplets,
    Hash,
    Thermometer,
    Plus,
    X,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { MethodIcon } from '@/components/shared';
import { CoffeeLoader } from '@/components/ui/coffee-loader';

interface BrewLogDetailDialogProps {
    log: BrewLog | null;
    isOpen: boolean;
    onClose: () => void;
    onSaveAsRecipe?: (log: BrewLog, newName: string) => Promise<void>;
    isLoading?: boolean;
}

export function BrewLogDetailDialog({
    log,
    isOpen,
    onClose,
    onSaveAsRecipe,
    isLoading
}: BrewLogDetailDialogProps) {
    const t = useTranslations('BrewLogCard');
    const tForm = useTranslations('BrewLogForm');
    const tTaste = useTranslations('Taste');
    const tCommon = useTranslations('Common');
    const format = useFormatter();

    const [showSaveAsNew, setShowSaveAsNew] = useState(false);
    const [newRecipeName, setNewRecipeName] = useState('');

    if (!log) return null;

    const formattedDate = format.dateTime(new Date(log.date), {
        month: 'long',
        day: 'numeric',
        year: 'numeric',
        hour: 'numeric',
        minute: 'numeric'
    });

    const hasTweaks = log.coffeeWeight || log.totalWaterWeight || log.grindSize || log.temperature || log.pours;

    const tasteItems = [
        { key: 'acidity', label: tTaste('acidity'), icon: Zap, value: log.tasteProfile.acidity },
        { key: 'sweetness', label: tTaste('sweetness'), icon: Candy, value: log.tasteProfile.sweetness },
        { key: 'body', label: tTaste('body'), icon: Circle, value: log.tasteProfile.body },
        { key: 'bitterness', label: tTaste('bitterness'), icon: AlertTriangle, value: log.tasteProfile.bitterness },
    ];

    const handleSaveAsRecipe = async () => {
        if (onSaveAsRecipe && newRecipeName) {
            await onSaveAsRecipe(log, newRecipeName);
            setShowSaveAsNew(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
            <DialogContent className="sm:max-w-lg rounded-[2rem] glass-card border-border/20 p-0 max-h-[90vh] overflow-y-auto custom-scrollbar">
                <DialogHeader className="p-6 pb-0">
                    <div className="flex items-center gap-4 mb-2">
                        <div className="p-3 rounded-2xl bg-secondary text-primary">
                            <MethodIcon method={log.method} className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-xl font-bold">{log.recipeName}</DialogTitle>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mt-0.5">
                                <Calendar className="w-3 h-3" />
                                <span className="font-mono">{formattedDate}</span>
                            </div>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-6 pt-4 space-y-8">
                    {/* Coffee Information */}
                    {log.coffeeName && (
                        <div className="bg-secondary/20 rounded-2xl p-4 flex items-center justify-between">
                            <div className="flex flex-col">
                                <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">{tForm('selectCoffee')}</span>
                                <span className="text-sm font-bold text-foreground">{log.coffeeName}</span>
                            </div>
                        </div>
                    )}

                    {/* Rating and Taste Radar */}
                    <div className="flex flex-col items-center gap-6">
                        <div className="flex items-center gap-1.5 bg-secondary/30 px-4 py-2 rounded-full">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <Star
                                    key={star}
                                    className={cn(
                                        'w-5 h-5',
                                        star <= log.rating
                                            ? 'fill-accent text-accent'
                                            : 'text-border'
                                    )}
                                />
                            ))}
                        </div>

                        <div className="relative w-40 h-40">
                            <svg viewBox="0 0 100 100" className="w-full h-full">
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
                            <span className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-2 text-[8px] font-bold text-muted-foreground uppercase">{tTaste('acidity').slice(0, 4)}</span>
                            <span className="absolute right-0 top-1/2 translate-x-2 -translate-y-1/2 text-[8px] font-bold text-muted-foreground uppercase">{tTaste('sweetness').slice(0, 5)}</span>
                            <span className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-2 text-[8px] font-bold text-muted-foreground uppercase">{tTaste('body')}</span>
                            <span className="absolute left-0 top-1/2 -translate-x-3 -translate-y-1/2 text-[8px] font-bold text-muted-foreground uppercase">{tTaste('bitterness').slice(0, 6)}</span>
                        </div>
                    </div>

                    {/* Taste Values Grid */}
                    <div className="grid grid-cols-4 gap-3">
                        {tasteItems.map(({ key, label, value }) => (
                            <div key={key} className="bg-secondary/20 rounded-xl py-2 px-1 text-center border border-border/10">
                                <div className="text-[10px] text-muted-foreground uppercase font-bold mb-1">{label}</div>
                                <div className="text-sm font-mono font-bold text-foreground">{value}%</div>
                            </div>
                        ))}
                    </div>

                    {/* Photos */}
                    {log.imageUrls && log.imageUrls.length > 0 && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{tForm('photos')}</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {log.imageUrls.map((url, i) => (
                                    <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-border/20">
                                        <Image
                                            src={url}
                                            alt={`Brew log ${i + 1}`}
                                            fill
                                            className="w-full h-full object-cover"
                                            sizes="(max-width: 768px) 33vw, 150px"
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tweaks */}
                    {hasTweaks && (
                        <div className="space-y-4">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{tForm('adjustTweaks')}</h4>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {log.coffeeWeight && (
                                    <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                                        <div className="flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase mb-1">
                                            <Scale className="w-3 h-3" /> {tForm('tweaks.coffee')}
                                        </div>
                                        <div className="text-sm font-mono font-bold">{log.coffeeWeight}g</div>
                                    </div>
                                )}
                                {log.totalWaterWeight && (
                                    <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                                        <div className="flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase mb-1">
                                            <Droplets className="w-3 h-3" /> {tForm('tweaks.water')}
                                        </div>
                                        <div className="text-sm font-mono font-bold">{log.totalWaterWeight}g</div>
                                    </div>
                                )}
                                {log.grindSize && (
                                    <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                                        <div className="flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase mb-1">
                                            <Hash className="w-3 h-3" /> {tForm('tweaks.grind')}
                                        </div>
                                        <div className="text-sm font-mono font-bold">{log.grindSize}µm</div>
                                    </div>
                                )}
                                {log.temperature && (
                                    <div className="bg-accent/5 rounded-xl p-3 border border-accent/10">
                                        <div className="flex items-center gap-1.5 text-accent text-[10px] font-bold uppercase mb-1">
                                            <Thermometer className="w-3 h-3" /> {tForm('tweaks.temp')}
                                        </div>
                                        <div className="text-sm font-mono font-bold">{log.temperature}°C</div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Notes */}
                    {log.notes && (
                        <div className="space-y-3">
                            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">{tForm('notes')}</h4>
                            <div className="bg-secondary/10 rounded-2xl p-4 border border-border/10 italic text-sm text-foreground/80 leading-relaxed">
                                &ldquo;{log.notes}&rdquo;
                            </div>
                        </div>
                    )}

                    {/* Save as New Recipe Action */}
                    {hasTweaks && onSaveAsRecipe && (
                        <div className="pt-4 border-t border-border/20">
                            {!showSaveAsNew ? (
                                <Button
                                    onClick={() => {
                                        setNewRecipeName(`${log.recipeName} (Variant)`);
                                        setShowSaveAsNew(true);
                                    }}
                                    variant="outline"
                                    className="w-full h-12 rounded-2xl border-accent/20 text-accent hover:bg-accent/5 font-bold"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    {tForm('saveAsNewRecipe')}?
                                </Button>
                            ) : (
                                <div className="space-y-3 animate-in slide-in-from-bottom-2">
                                    <Input
                                        value={newRecipeName}
                                        onChange={(e) => setNewRecipeName(e.target.value)}
                                        placeholder="Recipe Name"
                                        className="h-12 rounded-xl bg-background border-border/40 focus:ring-accent"
                                    />
                                    <div className="flex gap-2">
                                        <Button
                                            variant="ghost"
                                            onClick={() => setShowSaveAsNew(false)}
                                            className="flex-1 h-12 rounded-xl"
                                        >
                                            {tCommon('cancel')}
                                        </Button>
                                        <Button
                                            onClick={handleSaveAsRecipe}
                                            className="flex-[2] h-12 rounded-xl bg-accent text-accent-foreground hover:bg-accent/90 font-bold"
                                            disabled={!newRecipeName || isLoading}
                                        >
                                            {isLoading ? <CoffeeLoader className="w-4 h-4 mr-2" /> : <Plus className="w-4 h-4 mr-2" />}
                                            {tForm('saveAsNewRecipe')}
                                        </Button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                <div className="p-6 pt-2">
                    <Button onClick={onClose} variant="ghost" className="w-full rounded-2xl text-muted-foreground">
                        {tCommon('back')}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
