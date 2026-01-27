import { useState } from 'react';
import type { User } from '@supabase/supabase-js';
import { toast } from 'sonner';
import { useTranslations } from 'next-intl';
import type { Recipe, BrewLog, Coffee } from '@/lib/types';
import { useRecipes, useCoffees, useAllLogs } from '../hooks';

interface UseJournalProps {
    initialRecipes: Recipe[];
    initialLogs: BrewLog[];
    initialCoffees: Coffee[];
    user: User | null;
}

export function useJournal({ initialRecipes, initialLogs, initialCoffees, user }: UseJournalProps) {
    const t = useTranslations('HomePage');
    const tCommon = useTranslations('Common');

    // Async states for specific actions
    const [isSaving, setIsSaving] = useState(false);
    const [forkingRecipeId, setForkingRecipeId] = useState<string | null>(null);
    const [deletingRecipeId, setDeletingRecipeId] = useState<string | null>(null);

    // Data Hooks
    const {
        recipes: myRecipes,
        refresh: refreshMyRecipes,
        deleteRecipe: deleteRecipeAction
    } = useRecipes(initialRecipes, user?.id ?? 'guest');

    // Community Recipes
    const {
        recipes: communityRecipes,
        refresh: refreshCommunityRecipes
    } = useRecipes(undefined, undefined);

    const { logs, addLog: createLog } = useAllLogs(initialLogs);
    const { coffees, addCoffee, updateCoffee, deleteCoffee } = useCoffees(initialCoffees);

    // Actions
    const forkRecipe = async (recipe: Recipe) => {
        if (!user) return;
        try {
            setForkingRecipeId(recipe.id);
            const { RecipeService } = await import('@/lib/db-client');
            await RecipeService.forkRecipe(recipe.id, user.id);
            await refreshMyRecipes();
            toast.success(t('recipeForkedSuccess', { name: recipe.name }));
            // Return true to indicate success if the component needs to know
            return true;
        } catch (error) {
            console.error('Failed to fork recipe:', error);
            toast.error(t('recipeForkFailed'));
            return false;
        } finally {
            setForkingRecipeId(null);
        }
    };

    const saveLogAsRecipe = async (log: BrewLog, newName: string) => {
        try {
            setIsSaving(true);
            const { RecipeService, LogService } = await import('@/lib/db-client');

            // Find the original recipe for base data
            const originalRecipe = myRecipes.find(r => r.id === log.recipeId) ||
                communityRecipes.find(r => r.id === log.recipeId);

            if (!originalRecipe || !user) throw new Error('Original recipe or user not found');

            // Create new recipe with tweaks
            const newRecipe: Recipe = {
                ...originalRecipe,
                id: crypto.randomUUID(),
                owner_id: user.id,
                name: newName,
                createdAt: new Date(),
                coffeeWeight: log.coffeeWeight || originalRecipe.coffeeWeight,
                totalWaterWeight: log.totalWaterWeight || originalRecipe.totalWaterWeight,
                grindSize: log.grindSize || originalRecipe.grindSize,
                pours: log.pours || originalRecipe.pours,
                isPublic: false
            };

            await RecipeService.createRecipe(newRecipe);

            // Create log for the new recipe
            await LogService.createLog({ ...log, recipeId: newRecipe.id, recipeName: newName });

            await refreshMyRecipes();
            toast.success(tCommon('savedSuccess'));
            return newRecipe.id;
        } catch (error) {
            console.error('Failed to save log as recipe:', error);
            toast.error(tCommon('savedError'));
            return null;
        } finally {
            setIsSaving(false);
        }
    };

    const createRecipe = async (recipe: Recipe) => {
        try {
            setIsSaving(true);
            const { RecipeService } = await import('@/lib/db-client');
            await RecipeService.createRecipe(recipe);
            await refreshMyRecipes();
            toast.success(tCommon('savedSuccess'));
            return true;
        } catch (error) {
            console.error('Failed to save recipe:', error);
            toast.error(tCommon('savedError'));
            return false;
        } finally {
            setIsSaving(false);
        }
    };

    const deleteRecipe = async (id: string) => {
        try {
            setDeletingRecipeId(id);
            await deleteRecipeAction(id);
            toast.success(t('recipeDeletedSuccess'));
            return true;
        } catch (error) {
            console.error('Failed to delete recipe:', error);
            toast.error(t('recipeDeleteFailed'));
            return false;
        } finally {
            setDeletingRecipeId(null);
        }
    };

    return {
        // Data
        user,
        myRecipes,
        communityRecipes,
        logs,
        coffees,

        // Loading States
        isSaving,
        forkingRecipeId,
        deletingRecipeId,

        // Actions
        refreshMyRecipes,
        refreshCommunityRecipes,
        forkRecipe,
        createRecipe,
        saveLogAsRecipe,
        deleteRecipe,

        // Coffee Actions
        addCoffee,
        updateCoffee,
        deleteCoffee,
        createLog,
    };
}
