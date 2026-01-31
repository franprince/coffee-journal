import { useState, useEffect, useCallback } from 'react';
import { CoffeeService } from '@/lib/db-client';
import type { Coffee } from '@/lib/types';

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
