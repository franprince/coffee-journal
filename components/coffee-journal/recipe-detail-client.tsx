'use client';

import { useTranslations } from 'next-intl';

import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import { METHOD_LABELS } from '@/lib/types';
import type { BrewLog, Recipe, Coffee } from '@/lib/types';
import { useRecipe, useCoffees, useLogs } from '@/lib/hooks';
import { MethodIcon } from '@/components/coffee-journal/method-icons';
import { ChevronLeft, Coffee as CoffeeIcon, Droplets, Scale, X, BookOpen, Thermometer, Hash, Zap, Edit2, Trash2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PourTimeline } from '@/components/coffee-journal/pour-timeline';
import { BrewLogForm } from '@/components/coffee-journal/brew-log-form';
import { BrewLogCard } from '@/components/coffee-journal/brew-log-card';
import { RecipeForm } from '@/components/coffee-journal/recipe-form';
import { DeleteConfirmDialog } from '@/components/coffee-journal/delete-confirm-dialog';
import { BrewLogDetailDialog } from '@/components/coffee-journal/brew-log-detail-dialog';
import { cn } from '@/lib/utils';
import { useSettings } from '@/lib/hooks/use-settings';
import { micronsToClicks } from '@/lib/grinders';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { CoffeeLoader } from '@/components/ui/coffee-loader';

interface RecipeDetailClientProps {
    initialRecipe?: Recipe;
    initialLogs?: BrewLog[];
    initialCoffees?: Coffee[];
    recipeId: string;
    currentUser: User | null;
}

export default function RecipeDetailClient({ initialRecipe, initialLogs, initialCoffees, recipeId, currentUser }: RecipeDetailClientProps) {
    const t = useTranslations('RecipeDetail');
    const tMethods = useTranslations('Methods');
    const tCommon = useTranslations('Common');
    const tHome = useTranslations('HomePage');
    const router = useRouter();
    const { settings } = useSettings();

    // Using Hooks with properties
    const { recipe, isLoading: isLoadingRecipe, updateRecipe, deleteRecipe } = useRecipe(recipeId, initialRecipe);
    const { coffees, addCoffee } = useCoffees(initialCoffees);
    const { logs, addLog } = useLogs(recipeId, initialLogs);

    const [showLogForm, setShowLogForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [isSavingLog, setIsSavingLog] = useState(false);
    const [isForking, setIsForking] = useState(false);
    const [selectedLog, setSelectedLog] = useState<BrewLog | null>(null);

    const isLoading = isLoadingRecipe && !recipe;
    const isOwner = currentUser && recipe ? recipe.owner_id === currentUser.id : false;

    const handleSaveLog = async (log: BrewLog) => {
        setIsSavingLog(true);
        try {
            if (!isOwner && currentUser) {
                // Auto-fork logic
                const { RecipeService, LogService } = await import('@/lib/db-client');
                const newRecipeId = await RecipeService.forkRecipe(recipeId, currentUser.id);

                // Create log with new recipe ID
                const newLog = { ...log, recipeId: newRecipeId };
                await LogService.createLog(newLog);

                toast.success(tHome('recipeForkedSuccess', { name: recipe?.name || 'Recipe' }));
                router.push(`/recipe/${newRecipeId}`);
            } else {
                // Normal owner save
                await addLog(log);
                toast.success(tCommon('savedSuccess'));
            }
            setShowLogForm(false);
        } catch (error) {
            console.error('Failed to save log:', error);
            toast.error(tCommon('savedError'));
        } finally {
            setIsSavingLog(false);
        }
    };

    const handleSaveAsNewRecipe = async (log: BrewLog, newName: string) => {
        if (!currentUser || !recipe) return;
        setIsSavingLog(true);
        try {
            const { RecipeService, LogService } = await import('@/lib/db-client');

            // Create new recipe with tweaks
            const newRecipe: Recipe = {
                ...recipe,
                id: crypto.randomUUID(),
                owner_id: currentUser.id,
                name: newName,
                createdAt: new Date(),
                coffeeWeight: log.coffeeWeight || recipe.coffeeWeight,
                totalWaterWeight: log.totalWaterWeight || recipe.totalWaterWeight,
                grindSize: log.grindSize || recipe.grindSize,
                pours: log.pours || recipe.pours,
                // Ensure we don't accidentally copy ID-specific fields if any (already handled by spread/overwrite)
                isPublic: false // Default to private for variants
            };

            await RecipeService.createRecipe(newRecipe);

            // Create log for the new recipe
            await LogService.createLog({ ...log, recipeId: newRecipe.id, recipeName: newName });

            toast.success(tCommon('savedSuccess'));
            router.push(`/recipe/${newRecipe.id}`);
        } catch (error) {
            console.error('Failed to save new recipe:', error);
            toast.error(tCommon('savedError'));
        } finally {
            setIsSavingLog(false);
        }
    };

    const handleEditRecipe = async (updatedRecipe: Recipe) => {
        await updateRecipe(updatedRecipe);
        setShowEditForm(false);
        toast.success(tCommon('savedSuccess'));
    };

    const handleDeleteRecipe = async () => {
        setShowDeleteConfirm(true);
    };

    const confirmDelete = async () => {
        try {
            await deleteRecipe();
            toast.success(tHome('recipeDeletedSuccess'));
            router.push('/');
        } catch (error) {
            console.error('Failed to delete', error);
            toast.error(tHome('recipeDeleteFailed'));
        }
    };

    const handleForkRecipe = async () => {
        if (!currentUser || !recipe) return;
        setIsForking(true);
        try {
            const { RecipeService } = await import('@/lib/db-client');
            await RecipeService.forkRecipe(recipe.id, currentUser.id);
            toast.success(tHome('recipeForkedSuccess', { name: recipe.name }));
            // Redirect to home or stay? Maybe redirect to home to see the new copy
            router.push('/');
        } catch (error) {
            console.error('Failed to fork recipe:', error);
            toast.error(tHome('recipeForkFailed'));
        } finally {
            setIsForking(false);
        }
    };

    if (isLoading) {
        return <div className="min-h-screen flex items-center justify-center bg-background text-foreground animate-pulse">Loading...</div>;
    }

    if (!recipe) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-background text-foreground">
                <h1 className="text-3xl font-bold mb-4">{t('notFoundTitle')}</h1>
                <Link href="/">
                    <Button className="rounded-full">{t('goHome')}</Button>
                </Link>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-background p-4 md:p-8">
            <div className="max-w-3xl mx-auto space-y-8">
                {/* Recipe Detail View Container - Soft Modern */}
                <div className="relative modern-card rounded-3xl overflow-hidden border-none ring-1 ring-border/20 shadow-xl">
                    {/* Back button */}
                    <Link
                        href="/"
                        className="inline-flex items-center gap-1 px-4 py-2 rounded-full bg-secondary hover:bg-secondary/80 text-foreground transition-all ml-8 mt-8 group font-medium text-sm"
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        {t('back')}
                    </Link>

                    <div className="p-4 pt-4 md:p-8 md:pt-6">
                        {/* Recipe Header */}
                        <div className="flex flex-col sm:flex-row items-start justify-between gap-4 mb-6 md:mb-10">
                            <div className="flex items-start gap-3 md:gap-4">
                                <div className="flex flex-col items-center gap-2">
                                    <div className="p-3 md:p-4 rounded-xl md:rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
                                        <MethodIcon method={recipe.method} className="w-6 h-6 md:w-8 md:h-8" />
                                    </div>
                                    <span className="px-1.5 py-0.5 rounded-full bg-accent/10 text-accent text-[9px] md:text-[10px] font-bold uppercase tracking-wide text-center">
                                        {METHOD_LABELS[recipe.method as keyof typeof METHOD_LABELS] ? tMethods(recipe.method) : recipe.method}
                                    </span>
                                </div>
                                <div className="pt-1">
                                    <h2 className="text-2xl md:text-4xl font-bold text-foreground leading-tight tracking-tight">
                                        {recipe.name}
                                    </h2>
                                </div>
                            </div>
                            <div className="flex items-center gap-1 md:gap-2 absolute top-0 right-0 p-4 sm:relative sm:p-0">
                                {isOwner ? (
                                    <>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary"
                                            onClick={() => setShowEditForm(true)}
                                        >
                                            <Edit2 className="w-4 h-4 md:w-5 md:h-5" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-destructive rounded-full hover:bg-destructive/10"
                                            onClick={handleDeleteRecipe}
                                        >
                                            <Trash2 className="w-4 h-4 md:w-5 md:h-5" />
                                        </Button>
                                    </>
                                ) : (
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="h-8 w-8 md:h-10 md:w-10 text-muted-foreground hover:text-primary rounded-full hover:bg-secondary"
                                        onClick={handleForkRecipe}
                                        disabled={isForking}
                                    >
                                        {isForking ? (
                                            <div className="w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
                                        ) : (
                                            <Heart className="w-4 h-4 md:w-5 md:h-5" />
                                        )}
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* Specs Grid - Floating Bubbles */}
                        <div className="grid grid-cols-3 sm:grid-cols-3 md:grid-cols-5 gap-2 md:gap-4 mb-6 md:mb-10">
                            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                                    <Zap className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('ratio')}</span>
                                </div>
                                <span className="text-base md:text-xl font-bold text-foreground">1:{(recipe.totalWaterWeight / recipe.coffeeWeight).toFixed(1)}</span>
                            </div>

                            {/* Coffee */}
                            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                                    <Scale className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('coffee')}</span>
                                </div>
                                <span className="text-sm md:text-lg font-mono font-medium">{recipe.coffeeWeight}g</span>
                            </div>

                            {/* Water */}
                            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                                <div className="flex items-center justify-center gap-1 text-coffee-water mb-0.5">
                                    <Droplets className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('water')}</span>
                                </div>
                                <span className="text-sm md:text-lg font-mono font-medium text-coffee-water">{recipe.totalWaterWeight}g</span>
                            </div>

                            {/* Grind */}
                            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                                    <Hash className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('grind')}</span>
                                </div>
                                <span className="text-sm md:text-lg font-medium">{recipe.grindSize}µm</span>
                                {settings?.preferredGrinder && (
                                    <span className="text-[10px] text-muted-foreground font-mono">
                                        ~{micronsToClicks(recipe.grindSize, settings.preferredGrinder)}
                                    </span>
                                )}
                            </div>

                            {/* Temp */}
                            <div className="col-span-1 p-2 md:p-4 rounded-xl md:rounded-2xl bg-secondary/30 flex flex-col gap-1 items-center justify-center text-center">
                                <div className="flex items-center justify-center gap-1 text-muted-foreground mb-0.5">
                                    <Thermometer className="w-3 h-3 md:w-4 md:h-4" />
                                    <span className="text-[10px] md:text-xs font-bold uppercase">{t('temp')}</span>
                                </div>
                                <span className="text-sm md:text-lg font-medium">{recipe.pours?.[0]?.temperature || 93}°C</span>
                            </div>
                        </div>

                        {/* Pour Timeline Component */}
                        <div className="mb-6 md:mb-10 bg-secondary/10 p-4 md:p-6 rounded-2xl md:rounded-3xl border border-border/40">
                            <h3 className="text-base md:text-lg font-bold mb-3 md:mb-4 text-foreground">{t('usageGuide')}</h3>
                            <PourTimeline pours={recipe.pours} totalWater={recipe.totalWaterWeight} />
                        </div>

                        {/* Action Button */}
                        <div className="sticky bottom-6 z-20">
                            {currentUser && (
                                <Button
                                    onClick={() => setShowLogForm(true)}
                                    className="w-full h-16 text-lg font-bold rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-xl shadow-primary/20 transition-transform active:scale-95"
                                    disabled={isSavingLog || isForking}
                                >
                                    {(isSavingLog || isForking) ? (
                                        <CoffeeLoader className="w-6 h-6 mr-2" />
                                    ) : (
                                        <CoffeeIcon className="w-6 h-6 mr-2" />
                                    )}
                                    {t('logBrew')}
                                </Button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Brew Logs Section */}
                <div className="space-y-6">
                    <div className="flex items-center justify-between px-4">
                        <h3 className="text-2xl font-bold flex items-center gap-2 text-foreground">
                            {t('brewLogsTitle')}
                            <span className="text-base text-muted-foreground font-medium bg-secondary/50 px-3 py-1 rounded-full">{logs.length}</span>
                        </h3>
                    </div>

                    {logs.length === 0 ? (
                        <div className="modern-card border border-dashed border-border p-12 text-center bg-transparent shadow-none">
                            <p className="text-muted-foreground mb-4">{t('noLogsDesc')}</p>
                            <Button
                                variant="outline"
                                onClick={() => setShowLogForm(true)}
                                className="rounded-full border-primary/20 text-primary hover:bg-primary/5"
                            >
                                {t('logFirstBrew')}
                            </Button>
                        </div>
                    ) : (
                        <div className="grid sm:grid-cols-2 gap-6">
                            {logs.map((log) => (
                                <BrewLogCard
                                    key={log.id}
                                    log={log}
                                    onClick={() => setSelectedLog(log)}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* Brew Log Form Modal */}
            {showLogForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-background/60 backdrop-blur-md animate-in fade-in duration-200">
                    <div className="bg-card w-full max-w-lg rounded-[2rem] shadow-2xl max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200 relative ring-1 ring-border/20">
                        <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-border/40 bg-card/80 backdrop-blur">
                            <h3 className="text-xl font-bold">{t('logBrewModalTitle')}</h3>
                            <button
                                onClick={() => setShowLogForm(false)}
                                className="p-2 rounded-full hover:bg-secondary transition-colors"
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
                                onSaveAsNewRecipe={handleSaveAsNewRecipe}
                                onCancel={() => setShowLogForm(false)}
                                isLoading={isSavingLog}
                            />
                        </div>
                    </div>
                </div>
            )}

            {showEditForm && (
                <div className="fixed inset-0 z-50 flex items-center justify-end bg-background/30 backdrop-blur-md">
                    <div className="w-full max-w-md bg-card border-l border-border/20 h-full shadow-2xl p-6 overflow-y-auto animate-in slide-in-from-right duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-2xl font-bold">{t('editRecipeTitle')}</h3>
                            <button
                                onClick={() => setShowEditForm(false)}
                                className="p-2 rounded-full hover:bg-secondary transition-colors"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <RecipeForm
                            editRecipe={recipe}
                            onSave={handleEditRecipe}
                        />
                    </div>
                </div>
            )}

            <DeleteConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title={t('deleteRecipeTitle')}
                description={t('deleteRecipeDesc', { name: recipe.name })}
            />

            <BrewLogDetailDialog
                log={selectedLog}
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                onSaveAsRecipe={handleSaveAsNewRecipe}
                isLoading={isSavingLog}
            />
        </div>
    );
}
