'use client';

import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { SAMPLE_RECIPES } from '@/lib/data';
import { METHOD_LABELS } from '@/lib/types';
import { MethodIcon } from '@/components/coffee-journal/method-icons';
import { ChevronLeft, Coffee, Droplets, Scale, Clock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function RecipeDetailPage() {
    const params = useParams();
    const id = params?.id as string;
    const recipe = SAMPLE_RECIPES.find((r) => r.id === id);

    if (!recipe) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <h1 className="text-2xl font-bold mb-4">Recipe not found</h1>
                <Link href="/">
                    <Button>Go Home</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-3xl mx-auto">
                {/* Recipe Detail View Container */}
                <div className="relative glass-card rounded-[2.5rem] overflow-hidden border border-white/10 shadow-2xl animate-fade-in-up">
                    {/* Back button */}
                    <Link
                        href="/"
                        className="absolute top-6 left-6 p-2 rounded-full bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground z-10 flex items-center gap-1 text-sm backdrop-blur-md transition-all border border-white/5"
                    >
                        <ChevronLeft className="w-4 h-4" />
                        <span className="hidden sm:inline font-medium">Back</span>
                    </Link>

                    <div className="p-8 pt-20">
                        {/* Recipe Header - Compact & Cohesive */}
                        <div className="flex items-start gap-5 mb-8">
                            <div className="p-4 rounded-3xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary border border-white/5 shadow-inner">
                                <MethodIcon method={recipe.method} className="w-8 h-8" />
                            </div>
                            <div className="flex-1">
                                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2">
                                    <div>
                                        <h2 className="font-serif text-3xl font-bold text-gradient mb-1">
                                            {recipe.name}
                                        </h2>
                                        <p className="text-sm text-muted-foreground font-medium tracking-wide uppercase opacity-80">
                                            {METHOD_LABELS[recipe.method as keyof typeof METHOD_LABELS] || recipe.method}
                                        </p>
                                    </div>
                                </div>

                                {/* Consolidated Stats Row */}
                                <div className="flex items-center gap-6 mt-4 text-sm bg-white/5 p-3 rounded-2xl border border-white/5 inline-flex backdrop-blur-sm">
                                    {/* Ratio */}
                                    <div className="flex items-baseline gap-1.5">
                                        <span className="font-mono text-xl font-bold text-primary tracking-tight">
                                            1:{(recipe.totalWaterWeight / recipe.coffeeWeight).toFixed(1)}
                                        </span>
                                        <span className="text-xs text-muted-foreground font-medium uppercase tracking-wider">ratio</span>
                                    </div>

                                    <div className="w-px h-8 bg-border" />

                                    {/* Coffee */}
                                    <div className="flex items-center gap-2">
                                        <Scale className="w-4 h-4 text-muted-foreground" />
                                        <span className="font-mono font-bold text-foreground">{recipe.coffeeWeight}g</span>
                                        <span className="text-xs text-muted-foreground hidden sm:inline">coffee</span>
                                    </div>

                                    <div className="w-px h-8 bg-border" />

                                    {/* Water */}
                                    <div className="flex items-center gap-2">
                                        <Droplets className="w-4 h-4 text-coffee-water" />
                                        <span className="font-mono font-bold text-coffee-water">{recipe.totalWaterWeight}g</span>
                                        <span className="text-xs text-muted-foreground hidden sm:inline">water</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Grind & Temp Grid */}
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">Grind Size</span>
                                <span className="text-lg font-medium text-foreground">
                                    {recipe.grindSize} <span className="text-sm text-muted-foreground ml-1">click(s)</span>
                                </span>
                            </div>
                            <div className="p-4 rounded-3xl bg-white/5 border border-white/5">
                                <span className="text-xs text-muted-foreground uppercase tracking-wider font-medium block mb-1">Temperature</span>
                                {/* Assuming first pour temp for now as general temp */}
                                <span className="text-lg font-medium text-foreground">
                                    {recipe.pours?.[0]?.temperature || 93}°{recipe.pours?.[0]?.temperatureUnit || 'C'}
                                </span>
                            </div>
                        </div>

                        {/* Pour Timeline */}
                        <div className="space-y-6">
                            <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                                <Clock className="w-5 h-5 text-primary" />
                                Brew Schedule
                            </h3>

                            <div className="relative pl-4 space-y-8 before:absolute before:left-[19px] before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                                {recipe.pours?.map((pour, idx) => (
                                    <div key={pour.id} className="relative pl-8 animate-fade-in-up" style={{ animationDelay: `${idx * 0.1}s` }}>
                                        {/* Dot */}
                                        <div className={`absolute left-[11px] top-1.5 w-4 h-4 rounded-full border-2 border-background z-10 ${idx === 0 || pour.notes?.toLowerCase().includes('bloom')
                                                ? 'bg-accent shadow-[0_0_10px_oklch(0.65_0.18_55_/_0.5)] border-accent/20'
                                                : 'bg-coffee-espresso'
                                            }`} />

                                        <div className="bg-white/5 rounded-2xl p-4 border border-white/5 hover:bg-white/10 transition-colors">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-mono text-lg font-bold text-primary">{pour.time}</span>
                                                <span className="font-mono text-sm font-medium text-coffee-water">
                                                    {pour.waterAmount}g <span className="text-muted-foreground">water</span>
                                                </span>
                                            </div>

                                            {pour.notes && (
                                                <p className={`text-sm ${idx === 0 || pour.notes?.toLowerCase().includes('bloom')
                                                        ? 'text-accent font-medium uppercase tracking-wide'
                                                        : 'text-muted-foreground'
                                                    }`}>
                                                    {pour.notes}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Action Button */}
                        <div className="mt-10 sticky bottom-6">
                            <Button className="w-full rounded-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-[0_0_30px_oklch(0.65_0.18_55_/_0.3)] animate-pulse-glow">
                                <Coffee className="w-5 h-5 mr-2" />
                                Start Brewing
                            </Button>
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
}
