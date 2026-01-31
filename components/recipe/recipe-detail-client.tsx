'use client';

import { useTranslations } from 'next-intl';
import { useState } from 'react';
import { Link, useRouter } from '@/i18n/routing';
import type { BrewLog, Recipe, Coffee } from '@/lib/types';
import { useRecipe, useCoffees, useLogs } from '@/lib/hooks';
import { ChevronLeft, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { PourTimeline, DeleteConfirmDialog } from '@/components/shared';
import { BrewLogForm, BrewLogCard, BrewLogDetailDialog } from '@/components/brew-log';
import { RecipeForm } from '@/components/recipe';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';

// Extracted Components
import { RecipeHeader } from './recipe-header';
import { RecipeSpecs } from './recipe-specs';

interface RecipeDetailClientProps {
    initialRecipe?: Recipe;
    initialLogs?: BrewLog[];
    initialCoffees?: Coffee[];
    recipeId: string;
    currentUser: User | null;
}

export default function RecipeDetailClient({ initialRecipe, initialLogs, initialCoffees, recipeId, currentUser }: RecipeDetailClientProps) {
    const t = useTranslations('RecipeDetail');
    const tCommon = useTranslations('Common');
    const tHome = useTranslations('HomePage');
    const router = useRouter();

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
                        aria-label={t('back')}
                    >
                        <ChevronLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                        {t('back')}
                    </Link>

                    <div className="p-4 pt-4 md:p-8 md:pt-6">
                        {/* Recipe Header */}
                        <RecipeHeader
                            recipe={recipe}
                            isOwner={isOwner}
                            currentUser={currentUser}
                            onEdit={() => setShowEditForm(true)}
                            onDelete={handleDeleteRecipe}
                            onFork={handleForkRecipe}
                            isForking={isForking}
                        />

                        {/* Specs Grid - Floating Bubbles */}
                        <RecipeSpecs recipe={recipe} />

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
                                    className="w-full h-14 rounded-full bg-primary hover:bg-primary/95 text-primary-foreground text-lg font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] animate-in slide-in-from-bottom-4 duration-500"
                                >
                                    <Edit2 className="w-5 h-5 mr-2" />
                                    {t('logBrew')}
                                </Button>
                            )}
                        </div>

                        {/* Brew Logs History */}
                        <div className="mt-12">
                            <h3 className="text-xl font-bold mb-6 px-1 flex items-center gap-2">
                                {t('history')}
                                <span className="text-xs font-normal text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                                    {logs.length}
                                </span>
                            </h3>

                            {logs.length === 0 ? (
                                <div className="text-center py-12 rounded-3xl bg-secondary/5 border-2 border-dashed border-border/30">
                                    <p className="text-muted-foreground font-medium">{t('noLogs')}</p>
                                    <p className="text-xs text-muted-foreground/60 mt-1">{t('startBrewing')}</p>
                                </div>
                            ) : (
                                <div className="grid gap-4 sm:grid-cols-2">
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
                </div>
            </div>

            {/* Dialogs */}
            <Dialog open={showLogForm} onOpenChange={setShowLogForm}>
                <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('logBrewTitle')}</DialogTitle>
                    </DialogHeader>
                    {recipe && (
                        <BrewLogForm
                            recipe={recipe}
                            coffees={coffees}
                            onAddCoffee={addCoffee}
                            onSave={handleSaveLog}
                            onSaveAsNewRecipe={handleSaveAsNewRecipe}
                            onCancel={() => setShowLogForm(false)}
                            isLoading={isSavingLog}
                            user={currentUser}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <Dialog open={showEditForm} onOpenChange={setShowEditForm}>
                <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{t('editRecipe')}</DialogTitle>
                    </DialogHeader>
                    {recipe && (
                        <RecipeForm
                            editRecipe={recipe}
                            onSave={handleEditRecipe}
                        />
                    )}
                </DialogContent>
            </Dialog>

            <BrewLogDetailDialog
                log={selectedLog}
                isOpen={!!selectedLog}
                onClose={() => setSelectedLog(null)}
                onSaveAsRecipe={handleSaveAsNewRecipe}
            />

            <DeleteConfirmDialog
                isOpen={showDeleteConfirm}
                onClose={() => setShowDeleteConfirm(false)}
                onConfirm={confirmDelete}
                title={t('deleteTitle')}
                description={t('deleteDesc', { name: recipe.name })}
            />
        </div>
    );
}
