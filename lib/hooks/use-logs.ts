import { useState, useEffect, useCallback } from 'react';
import { LogService } from '@/lib/db-client';
import type { BrewLog } from '@/lib/types';

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
