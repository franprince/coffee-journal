import { useState, useEffect, useCallback } from 'react';
import { RecipeService, CoffeeService, LogService } from '@/lib/db-client';
import type { Recipe, Coffee, BrewLog } from '@/lib/types';

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

export function useCoffees(initialData?: Coffee[]) {
    const [coffees, setCoffees] = useState<Coffee[]>(initialData || []);
    const [isLoading, setIsLoading] = useState(!initialData);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        const data = await CoffeeService.getCoffees();
        setCoffees(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!initialData) {
            refresh();
        }
    }, [refresh, initialData]);

    const addCoffee = async (coffee: Coffee) => {
        await CoffeeService.addCoffee(coffee);
        await refresh();
    };

    const updateCoffee = async (coffee: Coffee) => {
        await CoffeeService.updateCoffee(coffee);
        await refresh();
    };

    const deleteCoffee = async (id: string) => {
        await CoffeeService.deleteCoffee(id);
        await refresh();
    };

    return { coffees, isLoading, addCoffee, updateCoffee, deleteCoffee, refresh };
}

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

export function useLogs(recipeId: string, initialData?: BrewLog[]) {
    const [logs, setLogs] = useState<BrewLog[]>(initialData || []);
    const [isLoading, setIsLoading] = useState(!initialData);

    const refresh = useCallback(async () => {
        if (!recipeId) return;
        setIsLoading(true);
        const data = await LogService.getLogsForRecipe(recipeId);
        setLogs(data);
        setIsLoading(false);
    }, [recipeId]);

    useEffect(() => {
        if (!initialData) {
            refresh();
        }
    }, [refresh, initialData]);

    const addLog = async (log: BrewLog) => {
        await LogService.createLog(log);
        await refresh();
    };

    return { logs, isLoading, addLog, refresh };
}

export function useAllLogs(initialData?: BrewLog[]) {
    const [logs, setLogs] = useState<BrewLog[]>(initialData || []);
    const [isLoading, setIsLoading] = useState(!initialData);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        const data = await LogService.getAllLogs();
        setLogs(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        if (!initialData) {
            refresh();
        }
    }, [refresh, initialData]);

    const addLog = async (log: BrewLog) => {
        await LogService.createLog(log);
        await refresh();
    };

    return { logs, isLoading, addLog, refresh };
}
