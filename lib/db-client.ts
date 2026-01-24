import { createClient } from '@/lib/supabase/client';
import type { Recipe, BrewLog, Coffee } from '@/lib/types';
import { mapRecipeFromDB, mapLogFromDB, mapCoffeeFromDB } from './db-mappers';

// Helper to check if Supabase is configured
const isSupabaseConfigured = () => {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

export const RecipeService = {
    async getRecipes(): Promise<Recipe[]> {
        if (!isSupabaseConfigured()) return [];

        const supabase = createClient();
        const { data, error } = await supabase
            .from('recipes')
            .select('*, pours(*), coffees(image_url)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching recipes:', error);
            return [];
        }

        return data.map(dbRecipe => ({
            ...mapRecipeFromDB(dbRecipe),
            coffeeImageUrl: dbRecipe.coffees?.image_url
        }));
    },

    async getRecipe(id: string): Promise<Recipe | undefined> {
        if (!isSupabaseConfigured()) {
            return undefined;
        }

        const supabase = createClient();
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
    },

    async createRecipe(recipe: Recipe): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.log('Mock create recipe:', recipe);
            return;
        }

        const supabase = createClient();

        // Insert recipe first
        const dbRecipe = {
            id: recipe.id,
            name: recipe.name,
            method: recipe.method,
            coffee_weight: recipe.coffeeWeight,
            total_water_weight: recipe.totalWaterWeight,
            grind_size: recipe.grindSize,
            water_type: recipe.waterType || null,
            coffee_id: recipe.coffeeId || null,
        };

        const { error: recipeError } = await supabase
            .from('recipes')
            .insert(dbRecipe);

        if (recipeError) {
            console.error('Error creating recipe:', recipeError);
            throw recipeError;
        }

        // Insert pours
        if (recipe.pours && recipe.pours.length > 0) {
            const dbPours = recipe.pours.map((pour, index) => ({
                id: pour.id,
                recipe_id: recipe.id,
                time: pour.time,
                water_amount: pour.waterAmount,
                temperature: pour.temperature,
                temperature_unit: pour.temperatureUnit,
                notes: pour.notes || null,
                order_index: index,
            }));

            const { error: poursError } = await supabase
                .from('pours')
                .insert(dbPours);

            if (poursError) {
                console.error('Error creating pours:', poursError);
                throw poursError;
            }
        }
    },

    async updateRecipe(recipe: Recipe): Promise<void> {
        if (!isSupabaseConfigured()) return;

        const supabase = createClient();

        const dbRecipe = {
            name: recipe.name,
            method: recipe.method,
            coffee_weight: recipe.coffeeWeight,
            total_water_weight: recipe.totalWaterWeight,
            grind_size: recipe.grindSize,
            water_type: recipe.waterType || null,
            coffee_id: recipe.coffeeId || null,
        };

        const { error: recipeError } = await supabase
            .from('recipes')
            .update(dbRecipe)
            .eq('id', recipe.id);

        if (recipeError) throw recipeError;

        // Update pours: delete old and insert new
        const { error: deletePoursError } = await supabase
            .from('pours')
            .delete()
            .eq('recipe_id', recipe.id);

        if (deletePoursError) throw deletePoursError;

        if (recipe.pours && recipe.pours.length > 0) {
            const dbPours = recipe.pours.map((pour, index) => ({
                id: pour.id || crypto.randomUUID(),
                recipe_id: recipe.id,
                time: pour.time,
                water_amount: pour.waterAmount,
                temperature: pour.temperature,
                temperature_unit: pour.temperatureUnit,
                notes: pour.notes || null,
                order_index: index,
            }));

            const { error: poursError } = await supabase
                .from('pours')
                .insert(dbPours);

            if (poursError) throw poursError;
        }
    },

    async deleteRecipe(id: string): Promise<void> {
        if (!isSupabaseConfigured()) return;
        const supabase = createClient();

        await supabase.from('pours').delete().eq('recipe_id', id);
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) throw error;
    }
};

export const CoffeeService = {
    async getCoffees(): Promise<Coffee[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from('coffees')
            .select('*')
            .eq('is_archived', false)
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching coffees:', error);
            return [];
        }
        return data.map(mapCoffeeFromDB);
    },

    async addCoffee(coffee: Coffee): Promise<void> {
        if (!isSupabaseConfigured()) {
            console.warn('Supabase not configured, cannot add coffee.');
            return;
        }

        const dbCoffee = {
            id: coffee.id, // Ensure ID is passed if generated on client, or omit to let DB generate
            name: coffee.name,
            roaster: coffee.roaster,
            roast_level: coffee.roastLevel,
            origin: coffee.origin,
            process: coffee.process,
            notes: coffee.notes,
            image_url: coffee.imageUrl, // Image support
            is_archived: coffee.isArchived || false,
        };

        const supabase = createClient();
        const { error } = await supabase.from('coffees').insert(dbCoffee);
        if (error) {
            console.error('Error adding coffee:', error);
            throw error;
        }
    },

    async updateCoffee(coffee: Coffee): Promise<void> {
        if (!isSupabaseConfigured()) return;

        const dbCoffee = {
            name: coffee.name,
            roaster: coffee.roaster,
            roast_level: coffee.roastLevel,
            origin: coffee.origin,
            process: coffee.process,
            notes: coffee.notes,
            image_url: coffee.imageUrl,
            is_archived: coffee.isArchived || false,
        };

        const supabase = createClient();
        const { error } = await supabase
            .from('coffees')
            .update(dbCoffee)
            .eq('id', coffee.id);

        if (error) throw error;
    },

    async deleteCoffee(id: string): Promise<void> {
        if (!isSupabaseConfigured()) return;
        const supabase = createClient();
        const { error } = await supabase.from('coffees').delete().eq('id', id);
        if (error) throw error;
    },

    async uploadCoffeeImage(file: Blob, fileName: string): Promise<string> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const supabase = createClient();
        const fileExt = 'jpg'; // We convert to jpeg in optimizeImage
        const path = `${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('coffee-images')
            .upload(path, file, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('coffee-images')
            .getPublicUrl(path);

        return data.publicUrl;
    }
};

export const LogService = {
    async getLogsForRecipe(recipeId: string): Promise<BrewLog[]> {
        if (!isSupabaseConfigured()) {
            return [];
        }

        const supabase = createClient();
        const { data, error } = await supabase
            .from('brew_logs')
            .select('*')
            .eq('recipe_id', recipeId)
            .order('date', { ascending: false });

        if (error) return [];
        return data.map(mapLogFromDB);
    },

    async createLog(log: BrewLog): Promise<void> {
        if (!isSupabaseConfigured()) return;

        const dbLog = {
            id: log.id,
            recipe_id: log.recipeId,
            rating: log.rating,
            notes: log.notes,
            taste_profile: log.tasteProfile,
            coffee_weight: log.coffeeWeight,
            total_water_weight: log.totalWaterWeight,
            grind_size: log.grindSize,
            temperature: log.temperature,
            custom_pours: log.pours,
            image_urls: log.imageUrls || [], // Image support
            date: log.date.toISOString(),
            coffee_id: log.coffeeId, // Link to coffee
        };

        const supabase = createClient();
        const { error } = await supabase.from('brew_logs').insert(dbLog);
        if (error) {
            console.error('Error saving log:', error);
            throw error;
        }
    },

    async getAllLogs(): Promise<BrewLog[]> {
        if (!isSupabaseConfigured()) return [];

        const supabase = createClient();
        const { data, error } = await supabase
            .from('brew_logs')
            .select(`
                *,
                recipes:recipe_id (name, method),
                coffees:coffee_id (name)
            `)
            .order('date', { ascending: false });

        if (error) {
            console.error('Error fetching all logs:', error);
            return [];
        }

        return data.map(dbLog => ({
            ...mapLogFromDB(dbLog),
            recipeName: dbLog.recipes?.name || 'Unknown Recipe',
            method: dbLog.recipes?.method || 'Unknown',
            coffeeName: dbLog.coffees?.name,
        }));
    },

    async uploadLogImage(file: Blob, fileName: string): Promise<string> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');

        const supabase = createClient();
        const fileExt = 'jpg';
        const path = `logs/${Date.now()}_${fileName.replace(/[^a-zA-Z0-9]/g, '_')}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
            .from('coffee-images') // Reusing same bucket for now
            .upload(path, file, {
                contentType: 'image/jpeg',
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Error uploading image:', uploadError);
            throw uploadError;
        }

        const { data } = supabase.storage
            .from('coffee-images')
            .getPublicUrl(path);

        return data.publicUrl;
    }
};
