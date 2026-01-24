'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { METHOD_LABELS } from '@/lib/types';
import type { BrewLog, Recipe, Coffee } from '@/lib/types';
import { useRecipe, useCoffees, useLogs } from '@/lib/hooks';
import { MethodIcon } from '@/components/coffee-journal/method-icons';
import { ChevronLeft, Coffee as CoffeeIcon, Droplets, Scale, X, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PourTimeline } from '@/components/coffee-journal/pour-timeline';
import { BrewLogForm } from '@/components/coffee-journal/brew-log-form';
import { BrewLogCard } from '@/components/coffee-journal/brew-log-card';
import { cn } from '@/lib/utils';

export default function RecipeDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    // Using Hooks
    const { recipe, isLoading: isLoadingRecipe } = useRecipe(id);
    const { coffees } = useCoffees();
    const { logs, addLog } = useLogs(id);

    const [showLogForm, setShowLogForm] = useState(false);

    const isLoading = isLoadingRecipe; // Simplified loading state

    const handleSaveLog = async (log: BrewLog) => {
        await addLog(log);
        setShowLogForm(false);
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground">Loading...</div>;
    }

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
            <div className="max-w-3xl mx-auto space-y-8">
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

                        {/* Pour Timeline Component */}
                        <div className="mb-10">
                            <PourTimeline pours={recipe.pours} totalWater={recipe.totalWaterWeight} />
                        </div>

                        {/* Action Button */}
                        <div className="sticky bottom-6">
                            <Button
                                onClick={() => setShowLogForm(true)}
                                className="w-full rounded-full h-14 text-lg font-bold bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 shadow-[0_0_30px_oklch(0.65_0.18_55_/_0.3)] animate-pulse-glow"
                            >
                                <CoffeeIcon className="w-5 h-5 mr-2" />
                                Start Brewing
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Brew Logs Section */}
                <div className="space-y-4 animate-fade-in-up stagger-1">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="font-serif text-xl font-bold flex items-center gap-2">
                            <BookOpen className="w-5 h-5 text-primary" />
                            Brew Logs
                        </h3>
                        <span className="text-sm text-muted-foreground">{logs.length} brews</span>
                    </div>

                    {logs.length === 0 ? (
                        <div className="glass-card rounded-3xl p-8 text-center border border-border">
                            <p className="text-muted-foreground">No brews logged for this recipe yet.</p>
                            <Button
                                variant="link"
                                onClick={() => setShowLogForm(true)}
                                className="text-primary mt-2"
                            >
                                Log your first brew
                            </Button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-4">
                            {logs.map((log) => (
                                <BrewLogCard key={log.id} log={log} />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Brew Log Form Modal */}
            {showLogForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative">
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
                            <h3 className="font-serif text-lg font-semibold text-coffee-espresso">Log Brew</h3>
                            <button
                                onClick={() => setShowLogForm(false)}
                                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <BrewLogForm
                                recipe={recipe}
                                coffees={coffees}
                                onSave={handleSaveLog}
                                onCancel={() => setShowLogForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
