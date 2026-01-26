import { useState, useEffect, useCallback } from 'react';
import { createClient } from '@/lib/supabase/client';
import type { GrinderId } from '@/lib/grinders';

export interface UserSettings {
    preferredGrinder: GrinderId;
}

const DEFAULT_SETTINGS: UserSettings = {
    preferredGrinder: 'comandante_c40'
};

export function useSettings() {
    const [settings, setSettings] = useState<UserSettings>(DEFAULT_SETTINGS);
    const [isLoading, setIsLoading] = useState(true);

    const fetchSettings = useCallback(async () => {
        try {
            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                setIsLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from('user_settings')
                .select('preferred_grinder')
                .eq('user_id', user.id)
                .maybeSingle();

            if (error && error.code !== 'PGRST116') { // PGRST116 is "no rows returned"
                console.error('Error fetching settings:', error);
            }

            if (data) {
                setSettings({ preferredGrinder: data.preferred_grinder as GrinderId });
            }
        } catch (error) {
            console.error('Failed to fetch settings:', error);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchSettings();
    }, [fetchSettings]);

    const updateGrinder = async (grinderId: GrinderId) => {
        try {
            // Optimistic update
            setSettings(prev => ({ ...prev, preferredGrinder: grinderId }));

            const supabase = createClient();
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) return;

            const { error } = await supabase
                .from('user_settings')
                .upsert({
                    user_id: user.id,
                    preferred_grinder: grinderId,
                    updated_at: new Date().toISOString()
                });

            if (error) throw error;
        } catch (error) {
            console.error('Failed to update grinder:', error);
            // Revert on error would go here ideally, but for now simple log
            fetchSettings();
        }
    };

    return {
        settings,
        isLoading,
        updateGrinder
    };
}
