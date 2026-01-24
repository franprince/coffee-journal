import type { Recipe, BrewLog, Coffee } from '@/lib/types';

export function mapCoffeeFromDB(dbCoffee: any): Coffee {
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

export function mapRecipeFromDB(dbRecipe: any): Recipe {
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

export function mapLogFromDB(dbLog: any): BrewLog {
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
        imageUrls: dbLog.image_urls || [],
        pours: dbLog.custom_pours,
        coffeeId: dbLog.coffee_id,
    };
}
