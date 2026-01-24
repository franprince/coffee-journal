import { useState, useEffect, useCallback } from 'react';
import { RecipeService, CoffeeService, LogService } from '@/lib/db';
import type { Recipe, Coffee, BrewLog } from '@/lib/types';

export function useRecipes() {
    const [recipes, setRecipes] = useState<Recipe[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const refresh = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await RecipeService.getRecipes();
            setRecipes(data);
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to fetch recipes'));
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addRecipe = async (recipe: Recipe) => { // Optimistic or Re-fetch? For now, re-fetch or manual update
        // We assume the service handles the DB insert
        // Since we don't have a createRecipe in Service yet (it was mocked in component), 
        // we might need to update Service or just expose a setter for now if it's client-side only for some parts.
        // Actually, RecipeService.getRecipes is async.
        // Let's assume we want to update the local list after saving.
        setRecipes(prev => [recipe, ...prev]);
    };

    return { recipes, isLoading, error, refresh, setRecipes };
}

export function useCoffees() {
    const [coffees, setCoffees] = useState<Coffee[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        const data = await CoffeeService.getCoffees();
        setCoffees(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addCoffee = async (coffee: Coffee) => {
        await CoffeeService.addCoffee(coffee);
        await refresh();
    };

    return { coffees, isLoading, addCoffee, refresh };
}

export function useRecipe(id: string) {
    const [recipe, setRecipe] = useState<Recipe | undefined>(undefined);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (!id) return;
        async function load() {
            setIsLoading(true);
            const data = await RecipeService.getRecipe(id);
            setRecipe(data);
            setIsLoading(false);
        }
        load();
    }, [id]);

    return { recipe, isLoading };
}

export function useLogs(recipeId: string) {
    const [logs, setLogs] = useState<BrewLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        if (!recipeId) return;
        setIsLoading(true);
        const data = await LogService.getLogsForRecipe(recipeId);
        setLogs(data);
        setIsLoading(false);
    }, [recipeId]);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addLog = async (log: BrewLog) => {
        await LogService.createLog(log);
        await refresh();
    };

    return { logs, isLoading, addLog, refresh };
}

export function useAllLogs() {
    const [logs, setLogs] = useState<BrewLog[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    const refresh = useCallback(async () => {
        setIsLoading(true);
        const data = await LogService.getAllLogs();
        setLogs(data);
        setIsLoading(false);
    }, []);

    useEffect(() => {
        refresh();
    }, [refresh]);

    const addLog = async (log: BrewLog) => {
        await LogService.createLog(log);
        await refresh();
    };

    return { logs, isLoading, addLog, refresh };
}
