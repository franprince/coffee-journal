'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { METHOD_LABELS } from '@/lib/types';
import type { BrewLog, Recipe, Coffee } from '@/lib/types';
import { useRecipe, useCoffees, useLogs } from '@/lib/hooks';
import { MethodIcon } from '@/components/coffee-journal/method-icons';
import { ChevronLeft, Coffee as CoffeeIcon, Droplets, Scale, X, BookOpen, Thermometer, Hash, Zap, Edit2, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PourTimeline } from '@/components/coffee-journal/pour-timeline';
import { BrewLogForm } from '@/components/coffee-journal/brew-log-form';
import { BrewLogCard } from '@/components/coffee-journal/brew-log-card';
import { RecipeForm } from '@/components/coffee-journal/recipe-form';
import { DeleteConfirmDialog } from '@/components/coffee-journal/delete-confirm-dialog';
import { cn } from '@/lib/utils';

export default function RecipeDetailPage() {
    const params = useParams();
    const router = useRouter();
    const id = params?.id as string;

    // Using Hooks
    const { recipe, isLoading: isLoadingRecipe, updateRecipe, deleteRecipe } = useRecipe(id);
    const { coffees, addCoffee } = useCoffees();
    const { logs, addLog } = useLogs(id);

    const [showLogForm, setShowLogForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

    const isLoading = isLoadingRecipe; // Simplified loading state

    const handleSaveLog = async (log: BrewLog) => {
        await addLog(log);
        setShowLogForm(false);
    };

    const handleEditRecipe = async (updatedRecipe: Recipe) => {
        await updateRecipe(updatedRecipe);
        setShowEditForm(false);
    };

    const handleDeleteRecipe = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        await deleteRecipe();
        router.push('/');
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
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-muted-foreground hover:text-foreground transition-all border border-white/5 mb-4 ml-6 mt-6 group"
                    >
                        <ChevronLeft className="w-3.5 h-3.5 transition-transform group-hover:-translate-x-0.5" />
                        <span className="font-bold text-[10px] uppercase tracking-wider">Back to Recipes</span>
                    </Link>

                    <div className="p-6 pt-0">
                        {/* Recipe Header - Compact & Cohesive */}
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3.5 rounded-2xl bg-gradient-to-br from-primary/10 to-secondary/10 text-primary border border-white/5 shadow-inner">
                                <MethodIcon method={recipe.method} className="w-6 h-6" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[10px] text-muted-foreground font-bold tracking-widest uppercase opacity-60 mb-0.5">
                                    {METHOD_LABELS[recipe.method as keyof typeof METHOD_LABELS] || recipe.method}
                                </p>
                                <h2 className="font-display text-2xl font-bold text-foreground leading-tight truncate">
                                    {recipe.name}
                                </h2>
                            </div>
                            <div className="flex items-center gap-1">
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-xl transition-all"
                                    onClick={() => setShowEditForm(true)}
                                >
                                    <Edit2 className="w-4 h-4" />
                                </Button>
                                <Button
                                    size="icon"
                                    variant="ghost"
                                    className="h-9 w-9 text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-xl transition-all"
                                    onClick={handleDeleteRecipe}
                                >
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </div>

                        {/* Specs Grid - Unified & Balanced */}
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-8">
                            {/* Ratio Box - Now first and uniform */}
                            <div className="col-span-1 p-3.5 rounded-2xl bg-primary/10 border border-primary/20 flex flex-col gap-1 shadow-lg shadow-primary/5">
                                <div className="flex items-center gap-1.5 text-primary">
                                    <Zap className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Ratio</span>
                                </div>
                                <span className="text-base font-display font-black leading-tight">1:{(recipe.totalWaterWeight / recipe.coffeeWeight).toFixed(1)}</span>
                            </div>

                            {/* Coffee & Water */}
                            <div className="col-span-1 p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Scale className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Coffee</span>
                                </div>
                                <span className="text-base font-mono font-bold leading-tight">{recipe.coffeeWeight}g</span>
                            </div>

                            <div className="col-span-1 p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-coffee-water">
                                    <Droplets className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Water</span>
                                </div>
                                <span className="text-base font-mono font-bold text-coffee-water leading-tight">{recipe.totalWaterWeight}g</span>
                            </div>

                            {/* Grind & Temp */}
                            <div className="col-span-1 p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Hash className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Grind</span>
                                </div>
                                <span className="text-base font-bold leading-tight">{recipe.grindSize}<span className="text-[10px] font-normal text-muted-foreground ml-1 uppercase">clicks</span></span>
                            </div>

                            <div className="col-span-1 p-3.5 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1">
                                <div className="flex items-center gap-1.5 text-muted-foreground">
                                    <Thermometer className="w-3.5 h-3.5" />
                                    <span className="text-[10px] font-bold uppercase tracking-wider">Temp</span>
                                </div>
                                <span className="text-base font-bold leading-tight">{recipe.pours?.[0]?.temperature || 93}°C</span>
                            </div>
                        </div>

                        {/* Pour Timeline Component */}
                        <div className="mb-8">
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
                                onAddCoffee={addCoffee}
                                onSave={handleSaveLog}
                                onCancel={() => setShowLogForm(false)}
                            />
                        </div>
                    </div>
                </div>
            )}
            {/* Edit Recipe Form Modal */}
            {showEditForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-3xl border border-border shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative">
                        <div className="sticky top-0 z-10 flex items-center justify-between p-4 border-b border-border bg-card/95 backdrop-blur">
                            <h3 className="font-display text-lg font-semibold text-coffee-espresso">Edit Recipe</h3>
                            <button
                                onClick={() => setShowEditForm(false)}
                                className="p-2 rounded-lg hover:bg-secondary/50 transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="p-6">
                            <RecipeForm
                                editRecipe={recipe}
                                onSave={handleEditRecipe}
                            />
                        </div>
                    </div>
                </div>
            )}

            <DeleteConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title="Delete Recipe?"
                description={`Are you sure you want to delete "${recipe.name}"? This will also remove any associated brew logs. This action cannot be undone.`}
            />
        </div>
    );
}
