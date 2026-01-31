import { createClient } from '@/lib/supabase/client';
import type { Recipe, BrewLog, Coffee } from '@/lib/types';
import { mapRecipeFromDB, mapLogFromDB, mapCoffeeFromDB } from './db-mappers';

// Helper to check if Supabase is configured
const isSupabaseConfigured = () => {
    return !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
};

// Helper to extract storage path from public URL
const getStoragePathFromUrl = (url: string, bucket: string) => {
    try {
        const parts = url.split(`/${bucket}/`);
        if (parts.length < 2) return null;
        // The URL might contain query params (e.g. for cache busting)
        return parts[1].split('?')[0];
    } catch (error) {
        console.error('Error extracting storage path:', error);
        return null;
    }
};

export const RecipeService = {
    async getRecipes(ownerId?: string): Promise<Recipe[]> {
        if (!isSupabaseConfigured()) return [];

        const supabase = createClient();
        let query = supabase
            .from('recipes')
            .select('*, pours(*), coffees(image_url)')
            .order('created_at', { ascending: false });

        if (ownerId) {
            query = query.eq('owner_id', ownerId);
        } else {
            // Community view: only show public recipes
            query = query.eq('is_public', true);
        }

        const { data, error } = await query;

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

        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

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
            owner_id: user.id,
            is_public: recipe.isPublic !== undefined ? recipe.isPublic : true
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

        // 1. Fetch images from logs before deleting them
        const { data: logs } = await supabase
            .from('brew_logs')
            .select('image_urls')
            .eq('recipe_id', id);

        if (logs && logs.length > 0) {
            const allImages = logs.flatMap(log => log.image_urls || []);
            const paths = allImages
                .map(url => getStoragePathFromUrl(url, 'coffee-images'))
                .filter(Boolean) as string[];

            if (paths.length > 0) {
                const { error: storageError } = await supabase.storage
                    .from('coffee-images')
                    .remove(paths);
                if (storageError) console.error('Error deleting recipe images:', storageError);
            }
        }

        // 2. Delete database records
        await supabase.from('pours').delete().eq('recipe_id', id);
        const { error } = await supabase.from('recipes').delete().eq('id', id);
        if (error) throw error;
    },

    async forkRecipe(originalRecipeId: string, newOwnerId: string): Promise<string> {
        if (!isSupabaseConfigured()) throw new Error('Supabase not configured');
        const supabase = createClient();

        // 1. Fetch original recipe
        const { data: original, error: fetchError } = await supabase
            .from('recipes')
            .select('*, pours(*)')
            .eq('id', originalRecipeId)
            .single();

        if (fetchError || !original) throw fetchError || new Error('Recipe not found');

        // 2. Create new recipe object (stripped of ID and user specific data)
        const newRecipeId = crypto.randomUUID();
        const dbRecipe = {
            id: newRecipeId,
            name: `${original.name} (Copy)`,
            method: original.method,
            coffee_weight: original.coffee_weight,
            total_water_weight: original.total_water_weight,
            grind_size: original.grind_size,
            water_type: original.water_type,
            coffee_id: original.coffee_id, // Keep link to coffee if public, otherwise might be null if strictly private (but we made them public)
            owner_id: newOwnerId,
            is_public: false // Forked recipes are private clones/copies by default
        };

        const { error: insertError } = await supabase
            .from('recipes')
            .insert(dbRecipe);

        if (insertError) throw insertError;

        // 3. Create new pours
        if (original.pours && original.pours.length > 0) {
            const dbPours = original.pours.map((pour: any) => ({
                id: crypto.randomUUID(),
                recipe_id: newRecipeId,
                time: pour.time,
                water_amount: pour.water_amount,
                temperature: pour.temperature,
                temperature_unit: pour.temperature_unit,
                notes: pour.notes,
                order_index: pour.order_index,
            }));

            const { error: poursError } = await supabase
                .from('pours')
                .insert(dbPours);

            if (poursError) throw poursError;
        }

        return newRecipeId;
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

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

        const dbCoffee = {
            id: coffee.id, // Ensure ID is passed if generated on client, or omit to let DB generate
            name: coffee.name,
            roaster: coffee.roaster,
            roast_level: coffee.roastLevel,
            origin: coffee.origin,
            farm: coffee.farm,
            altitude: coffee.altitude,
            process: coffee.process,
            variety: coffee.variety,
            flavors: coffee.flavors,
            notes: coffee.notes,
            image_url: coffee.imageUrl, // Image support
            is_archived: coffee.isArchived || false,
            owner_id: user.id
        };
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
            farm: coffee.farm,
            altitude: coffee.altitude,
            process: coffee.process,
            variety: coffee.variety,
            flavors: coffee.flavors,
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

        // Check authentication
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('You must be logged in to delete coffee');

        // 1. Fetch coffee to get image URL
        const { data: coffee } = await supabase
            .from('coffees')
            .select('image_url')
            .eq('id', id)
            .single();

        if (coffee?.image_url) {
            const path = getStoragePathFromUrl(coffee.image_url, 'coffee-images');
            if (path) {
                const { error: storageError } = await supabase.storage
                    .from('coffee-images')
                    .remove([path]);
                if (storageError) console.error('Error deleting coffee image:', storageError);
            }
        }

        // 2. Delete database record
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

        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) throw new Error('User not authenticated');

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
            coffee_id: log.coffeeId || null, // Ensure empty string becomes null
            owner_id: user.id
        };
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
