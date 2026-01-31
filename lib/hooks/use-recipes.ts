import { useState, useEffect, useCallback } from 'react';
import { RecipeService } from '@/lib/db-client';
import type { Recipe } from '@/lib/types';

export function useRecipes(initialData?: Recipe[], ownerId?: string) {
    const [recipes, setRecipes] = useState<Recipe[]>(initialData || []);
    const [isLoading, setIsLoading] = useState(!initialData);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await RecipeService.getRecipes(ownerId);
            setRecipes(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
        } finally {
            setIsLoading(false);
        }
    }, [ownerId]);

    useEffect(() => {
        if (!initialData) {
            refresh();
        }
    }, [refresh, initialData]);

    const addRecipe = async (recipe: Recipe) => {
        await RecipeService.createRecipe(recipe);
        await refresh();
    };

    const updateRecipe = async (recipe: Recipe) => {
        await RecipeService.updateRecipe(recipe);
        await refresh();
    };

    const deleteRecipe = async (id: string) => {
        await RecipeService.deleteRecipe(id);
        await refresh();
    };

    return { recipes, isLoading, error, refresh, addRecipe, updateRecipe, deleteRecipe };
}
