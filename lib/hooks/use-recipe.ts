import { useState, useEffect, useCallback } from 'react';
import { RecipeService } from '@/lib/db-client';
import type { Recipe } from '@/lib/types';

export function useRecipe(id: string, initialData?: Recipe) {
    const [recipe, setRecipe] = useState<Recipe | undefined>(initialData);
    const [isLoading, setIsLoading] = useState(!initialData);

    const refresh = useCallback(async () => {
        if (!id) return;
        setIsLoading(true);
        const data = await RecipeService.getRecipe(id);
        setRecipe(data);
        setIsLoading(false);
    }, [id]);

    useEffect(() => {
        if (!initialData) {
            refresh();
        }
    }, [refresh, initialData]);

    const updateRecipe = async (updatedRecipe: Recipe) => {
        await RecipeService.updateRecipe(updatedRecipe);
        await refresh();
    };

    const deleteRecipe = async () => {
        if (!id) return;
        await RecipeService.deleteRecipe(id);
    };

    return { recipe, isLoading, refresh, updateRecipe, deleteRecipe };
}
