import { createClient } from '@/lib/supabase/client';
import { SAMPLE_RECIPES, SAMPLE_LOGS, SAMPLE_COFFEES } from '@/lib/data';
import type { Recipe, BrewLog, Coffee } from '@/lib/types';

// Helper to check if Supabase is configured
const isSupabaseConfigured = () => {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

export const RecipeService = {
    async getRecipes(): Promise<Recipe[]> {
        if (!isSupabaseConfigured()) return SAMPLE_RECIPES;

        const supabase = createClient();
        const { data, error } = await supabase
            .from('recipes')
            .select('*, pours(*), coffees(image_url)')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching recipes:', error);
            return SAMPLE_RECIPES;
        }

        return data.map(dbRecipe => ({
            ...mapRecipeFromDB(dbRecipe),
            coffeeImageUrl: dbRecipe.coffees?.image_url
        }));
    },

    async getRecipe(id: string): Promise<Recipe | undefined> {
        if (!isSupabaseConfigured()) {
            return SAMPLE_RECIPES.find(r => r.id === id);
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
            // Need to return sample coffees if not configured
            return SAMPLE_COFFEES || [];
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
            return SAMPLE_LOGS.filter(l => l.recipeId === recipeId);
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
        if (!isSupabaseConfigured()) return SAMPLE_LOGS;

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
    }
};

// -- Mappers --

function mapCoffeeFromDB(dbCoffee: any): Coffee {
    return {
        id: dbCoffee.id,
        name: dbCoffee.name,
        roaster: dbCoffee.roaster,
        roastLevel: dbCoffee.roast_level,
        origin: dbCoffee.origin,
        process: dbCoffee.process,
        notes: dbCoffee.notes,
        imageUrl: dbCoffee.image_url,
        isArchived: dbCoffee.is_archived,
    };
}

function mapRecipeFromDB(dbRecipe: any): Recipe {
    return {
        id: dbRecipe.id,
        name: dbRecipe.name,
        method: dbRecipe.method,
        coffeeWeight: dbRecipe.coffee_weight,
        totalWaterWeight: dbRecipe.total_water_weight,
        grindSize: dbRecipe.grind_size,
        waterType: dbRecipe.water_type,
        coffeeId: dbRecipe.coffee_id,
        createdAt: new Date(dbRecipe.created_at),
        pours: dbRecipe.pours?.map((p: any) => ({
            id: p.id,
            time: p.time,
            waterAmount: p.water_amount,
            temperature: p.temperature,
            temperatureUnit: p.temperature_unit,
            notes: p.notes
        })).sort((a: any, b: any) => (a.order_index || 0) - (b.order_index || 0)) || []
    };
}

function mapLogFromDB(dbLog: any): BrewLog {
    return {
        id: dbLog.id,
        recipeId: dbLog.recipe_id,
        recipeName: 'Unknown', // We might need to join recipes to get name if not stored
        method: 'Unknown',     // Same here
        date: new Date(dbLog.date),
        rating: dbLog.rating,
        tasteProfile: dbLog.taste_profile,
        notes: dbLog.notes,
        coffeeWeight: dbLog.coffee_weight,
        totalWaterWeight: dbLog.total_water_weight,
        grindSize: dbLog.grind_size,
        temperature: dbLog.temperature,
        pours: dbLog.custom_pours,
        coffeeId: dbLog.coffee_id,
    };
}
