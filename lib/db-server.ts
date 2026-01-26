import { createClient as createServerClient } from '@/lib/supabase/server';
import type { Recipe, BrewLog, Coffee } from '@/lib/types';
import { mapRecipeFromDB, mapLogFromDB, mapCoffeeFromDB } from './db-mappers';

export const RecipeServiceServer = {
    async getRecipes(ownerId?: string): Promise<Recipe[]> {
        const supabase = await createServerClient();
        let query = supabase
            .from('recipes')
            .select('*, pours(*), coffees(image_url)')
            .order('created_at', { ascending: false });

        if (ownerId) {
            query = query.eq('owner_id', ownerId);
        }

        const { data, error } = await query;

        if (error) {
            console.error('Error fetching recipes (server):', error);
            return [];
        }

        return data.map(dbRecipe => ({
            ...mapRecipeFromDB(dbRecipe),
            coffeeImageUrl: dbRecipe.coffees?.image_url
        }));
    },

    async getRecipe(id: string): Promise<Recipe | undefined> {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from('recipes')
            .select('*, pours(*), coffees(image_url)')
            .eq('id', id)
            .single();

        if (error || !data) return undefined;
        return {
            ...mapRecipeFromDB(data),
            coffeeImageUrl: data.coffees?.image_url
        };
    }
};

export const LogServiceServer = {
    async getAllLogs(): Promise<BrewLog[]> {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from('brew_logs')
            .select(`
                *,
                recipes:recipe_id (name, method),
                coffees:coffee_id (name)
            `)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching all logs (server):', error);
            return [];
        }

        return data.map(dbLog => ({
            ...mapLogFromDB(dbLog),
            recipeName: dbLog.recipes?.name || 'Unknown Recipe',
            method: dbLog.recipes?.method || 'Unknown',
            coffeeName: dbLog.coffees?.name,
        }));
    },

    async getLogsForRecipe(recipeId: string): Promise<BrewLog[]> {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from('brew_logs')
            .select('*')
            .eq('recipe_id', recipeId)
            .order('date', { ascending: false });

        if (error) return [];
        return data.map(mapLogFromDB);
    }
};

export const CoffeeServiceServer = {
    async getCoffees(): Promise<Coffee[]> {
        const supabase = await createServerClient();
        const { data, error } = await supabase
            .from('coffees')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching coffees (server):', error);
            return [];
        }
        return data.map(mapCoffeeFromDB);
    }
};
